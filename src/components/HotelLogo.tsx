interface HotelLogoProps {
  className?: string;
}

export function HotelLogo({ className = 'h-8 w-8' }: HotelLogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.65"
      />
      <path
        d="M12 29V11H14.5V18.75H25.5V11H28V29H25.5V21H14.5V29H12Z"
        fill="currentColor"
      />
      <path
        d="M8 7H32"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      <path
        d="M8 33H32"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
    </svg>
  );
}
