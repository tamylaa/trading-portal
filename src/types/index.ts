export interface LayoutProps {
    children: React.ReactNode;
}

export interface HeaderProps {}
export interface FooterProps {}

declare global {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        REACT_APP_VERSION?: string;
        PUBLIC_URL: string;
    }
}