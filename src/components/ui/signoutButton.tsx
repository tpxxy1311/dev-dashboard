// src/components/ui/signoutButton.tsx
import { signOut } from "@/server/actions/signOut";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

type SignOutButtonProps = { className?: string };

const SignOutButton = ({ className }: SignOutButtonProps) => (
  <form action={signOut}>
    <button type="submit" className={className} aria-label="Logout">
      <ArrowRightStartOnRectangleIcon
        width={24}
        height={24}
        aria-hidden="true"
      />
    </button>
  </form>
);

export default SignOutButton;
