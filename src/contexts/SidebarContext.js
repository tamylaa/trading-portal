let mod;
try {
  mod = require('./SidebarContext.tsx');
} catch (err) {
  mod = require('./SidebarContext');
}
const candidate = mod && (mod.default || mod);

module.exports.SidebarProvider = candidate && (candidate.SidebarProvider || candidate.default?.SidebarProvider);
module.exports.useSidebar = candidate && (candidate.useSidebar || candidate.default?.useSidebar);
module.exports.default = candidate;
