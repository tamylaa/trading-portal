import subprocess
import time
import datetime
import os
import sys
import socket
import dns.resolver
from typing import Tuple, List, Optional
import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("github_ping_log.txt"),
        logging.StreamHandler()
    ]
)

class NetworkTroubleshooter:
    def __init__(self):
        self.github_domain = "github.com"
        self.dns_servers = [
            "8.8.8.8",  # Google DNS
            "1.1.1.1",  # Cloudflare DNS
            "208.67.222.222"  # OpenDNS
        ]
        self.original_dns = None
        self.original_network_state = None

    def is_admin(self) -> bool:
        """Checks if the script is running with administrator privileges."""
        if os.name == 'posix':
            try:
                return os.getuid() == 0
            except AttributeError:
                return False
        elif os.name == 'nt':
            try:
                import ctypes
                return ctypes.windll.shell32.IsUserAnAdmin() != 0
            except:
                return False
        return False

    def request_admin_privileges(self) -> None:
        """Requests administrator privileges if not already running as admin."""
        if not self.is_admin():
            logging.warning("This script requires administrator privileges.")
            if os.name == 'nt':
                import ctypes
                ctypes.windll.shell.ShellExecuteW(None, "runas", sys.executable, " ".join(sys.argv), None, 1)
            sys.exit(1)

    def get_current_dns(self) -> List[str]:
        """Get current DNS servers."""
        try:
            if os.name == 'nt':
                result = subprocess.run(['ipconfig', '/all'], capture_output=True, text=True)
                dns_servers = []
                for line in result.stdout.split('\n'):
                    if 'DNS Servers' in line:
                        dns_servers.append(line.split(':')[-1].strip())
                return dns_servers
            else:
                with open('/etc/resolv.conf', 'r') as f:
                    return [line.split()[1] for line in f if line.startswith('nameserver')]
        except Exception as e:
            logging.error(f"Failed to get current DNS: {e}")
            return []

    def resolve_github_ip(self) -> Optional[str]:
        """Resolve GitHub IP using multiple DNS servers."""
        for dns_server in self.dns_servers:
            try:
                resolver = dns.resolver.Resolver()
                resolver.nameservers = [dns_server]
                answers = resolver.resolve(self.github_domain, 'A')
                return str(answers[0])
            except Exception as e:
                logging.warning(f"Failed to resolve using {dns_server}: {e}")
        return None

    def run_ping(self, target: str, count: int = 4) -> Tuple[str, int]:
        """Run ping command with timeout."""
        ping_command = ["ping", target, "-n", str(count)] if os.name == 'nt' else ["ping", target, "-c", str(count)]
        try:
            result = subprocess.run(ping_command, capture_output=True, text=True, timeout=15)
            return result.stdout, result.returncode
        except subprocess.TimeoutExpired:
            return "Timeout", 1

    def analyze_ping(self, output: str, returncode: int) -> bool:
        """Analyze ping results."""
        if returncode != 0:
            logging.error(f"Ping failed (Return code: {returncode})")
            return False
        if "100% loss" in output.lower():
            logging.error("100% packet loss detected")
            return False
        logging.info("Ping successful")
        return True

    def backup_network_state(self) -> None:
        """Backup current network state."""
        self.original_dns = self.get_current_dns()
        logging.info(f"Backed up current DNS: {self.original_dns}")

    def restore_network_state(self) -> None:
        """Restore original network state."""
        if self.original_dns:
            logging.info("Restoring original DNS settings...")
            # Implementation depends on OS and would require admin rights
            pass

    def attempt_network_reset(self) -> bool:
        """Attempt network reset with user confirmation."""
        if os.name != 'nt':
            logging.warning("Network reset is only applicable to Windows")
            return False

        print("\nWARNING: This will temporarily disconnect your network.")
        print("Do you want to proceed? (y/n): ", end='')
        if input().lower() != 'y':
            return False

        try:
            logging.info("Releasing IP address...")
            subprocess.run(["ipconfig", "/release"], check=True, timeout=30)
            time.sleep(5)

            logging.info("Renewing IP address...")
            subprocess.run(["ipconfig", "/renew"], check=True, timeout=30)
            time.sleep(5)

            logging.info("Flushing DNS cache...")
            subprocess.run(["ipconfig", "/flushdns"], check=True, timeout=30)
            
            logging.info("Network reset completed")
            return True
        except subprocess.CalledProcessError as e:
            logging.error(f"Network reset failed: {e}")
            return False
        except subprocess.TimeoutExpired:
            logging.error("Network reset timed out")
            return False

    def attempt_dns_change(self) -> bool:
        """Attempt to change DNS servers."""
        if not self.original_dns:
            self.backup_network_state()

        print("\nWARNING: This will change your DNS settings.")
        print("Do you want to proceed? (y/n): ", end='')
        if input().lower() != 'y':
            return False

        try:
            # Implementation would depend on OS and require admin rights
            # This is a placeholder for the actual implementation
            logging.info("DNS change attempted")
            return True
        except Exception as e:
            logging.error(f"DNS change failed: {e}")
            return False

    def check_firewall(self) -> bool:
        """Check if firewall might be blocking the connection."""
        try:
            if os.name == 'nt':
                result = subprocess.run(['netsh', 'advfirewall', 'show', 'currentprofile'], 
                                     capture_output=True, text=True)
                logging.info(f"Firewall status: {result.stdout}")
            return True
        except Exception as e:
            logging.error(f"Failed to check firewall: {e}")
            return False

    def troubleshoot(self) -> None:
        """Main troubleshooting function."""
        self.request_admin_privileges()
        self.backup_network_state()

        logging.info("Starting GitHub connectivity troubleshooting...")
        
        # Try to resolve GitHub IP
        github_ip = self.resolve_github_ip()
        if not github_ip:
            logging.error("Failed to resolve GitHub IP")
            return

        logging.info(f"Resolved GitHub IP: {github_ip}")

        # Initial ping test
        output, returncode = self.run_ping(github_ip)
        if self.analyze_ping(output, returncode):
            logging.info("Initial ping successful")
            return

        # Check firewall
        self.check_firewall()

        # Try network reset
        if self.attempt_network_reset():
            output, returncode = self.run_ping(github_ip)
            if self.analyze_ping(output, returncode):
                return

        # Try DNS change
        if self.attempt_dns_change():
            output, returncode = self.run_ping(github_ip)
            if self.analyze_ping(output, returncode):
                return

        # Final attempt with direct IP
        logging.info("Attempting direct IP ping...")
        output, returncode = self.run_ping(github_ip)
        self.analyze_ping(output, returncode)

        # Restore original settings
        self.restore_network_state()

if __name__ == "__main__":
    troubleshooter = NetworkTroubleshooter()
    troubleshooter.troubleshoot()