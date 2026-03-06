import Image from "next/image"

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 24, className }: LogoProps) {
  return (
    <Image
      src="/fluxkit.png"
      alt="FluxKit logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}
