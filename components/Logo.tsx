interface LogoProps {
  className?: string;
  size?: number;
  color?: string;
  fillColor?: string;
}

export default function Logo({ className, size = 24, color = 'currentColor', fillColor = 'currentColor' }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
    >
      <path
        d="M7 12c.5 0 2.5-.4 4-3.5 1 0 3 0 4 3.5 1.5 3 1 5-1 6-2 1-4-.5-4-3-1 2.5-3 4-5 3-2-1-2.5-3-1-6Z"
        fill={fillColor}
      />
      <path d="M11 20c-1 1-2 2-4 2-2 0-3-1-3-3s1-2 2-3" />
      <path d="M13 20c1 1 2 2 4 2 2 0 3-1 3-3s-1-2-2-3" />
    </svg>
  );
}
