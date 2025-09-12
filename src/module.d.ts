declare module "*.module.css";
declare module "*.pdf";

declare module "@fuse/core/FuseSvgIcon" {
  import { ReactNode } from 'react';
  
  interface FuseSvgIconProps {
    children?: string;
    size?: number | string;
    color?: 'inherit' | 'disabled' | 'primary' | 'secondary' | 'action' | 'error' | 'info' | 'success' | 'warning';
    sx?: object;
    className?: string;
  }
  
  const FuseSvgIcon: React.FC<FuseSvgIconProps>;
  export default FuseSvgIcon;
}