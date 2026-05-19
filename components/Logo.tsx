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
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
    >
      <path
        d="M8.5 4C6.5 4 5 5.5 5 8C5 10.5 6 12 7 14C7.5 15.5 8 17 8 19C8 20.1 8.9 21 10 21C11.1 21 12 20.1 12 19V17H13V19C13 20.1 13.9 21 15 21C16.1 21 17 20.1 17 19C17 17 17.5 15.5 18 14C19 12 20 10.5 20 8C20 5.5 18.5 4 16.5 4C14.5 4 13.5 5 12.5 5C11.5 5 10.5 4 8.5 4Z"
        fill={fillColor}
      />
    </svg>
  );
}
