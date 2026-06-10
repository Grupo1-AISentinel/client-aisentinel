import { cn } from '../../utils/cn.js';

const Skeleton = ({ className, ...rest }) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-surface-bright relative overflow-hidden',
      'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-amber-400/10 after:to-transparent after:animate-shimmer',
      className
    )}
    {...rest}
  />
);

export default Skeleton;
