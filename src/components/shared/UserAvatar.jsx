import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function UserAvatar({ user, className }) {
  return (
    <Avatar className={className}>
      <AvatarImage
        src={user?.image || undefined}
        alt={user?.name || "User"}
        referrerPolicy="no-referrer"
      />
      <AvatarFallback className="bg-primary/10 text-primary">
        {getInitials(user?.name)}
      </AvatarFallback>
    </Avatar>
  );
}