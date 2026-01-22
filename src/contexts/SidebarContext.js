const mod = require('./SidebarContext');
module.exports = mod;
module.exports.SidebarProvider = mod.SidebarProvider || mod.default?.SidebarProvider;
module.exports.useSidebar = mod.useSidebar || mod.default?.useSidebar;
