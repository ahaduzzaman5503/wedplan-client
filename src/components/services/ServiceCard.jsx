import Link from "next/link";
import { Crown, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import UserAvatar from "@/components/shared/UserAvatar";
import { formatPrice } from "@/lib/format";

export default function ServiceCard({ service }) {
  const vendorName = service.vendor?.businessName || service.vendor?.name;

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg">
    <div className="w-full aspect-4/3 overflow-hidden bg-muted">        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.images?.[0]}
          alt={service.serviceName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="text-xs">
            {service.category}
          </Badge>
          <span className="shrink-0 font-semibold text-primary">
            {formatPrice(service.price)}
          </span>
        </div>

        <h3 className="line-clamp-2 font-heading text-lg font-semibold leading-snug">
          {service.serviceName}
        </h3>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">{service.location}</span>
        </p>

        <div className="mt-auto flex items-center gap-2 border-t pt-3">
          <UserAvatar
            user={{ name: service.vendor?.name, image: service.vendor?.image }}
            className="h-7 w-7"
          />
          <span className="truncate text-sm text-muted-foreground">
            {vendorName}
          </span>
          {service.vendor?.isPremium && (
            <Badge className="ml-auto shrink-0 gap-1 bg-accent text-accent-foreground">
              <Crown className="h-3 w-3" />
              Premium
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          nativeButton={false}
          render={<Link href={`/services/${service?._id}`} />}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
