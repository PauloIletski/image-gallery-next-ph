import { HTMLAttributes } from 'react'

interface LogoProps extends HTMLAttributes<HTMLImageElement> {
  width?: number
  height?: number
}

export default function Logo({ className, width = 200, height = 200, ...props }: LogoProps) {
  return (
    <img
      src='/LOGO_DA_IGREJA.svg'
      alt='Church Logo'
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
}
