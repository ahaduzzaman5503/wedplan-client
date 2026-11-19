"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { uploadImage } from "@/lib/upload";
import { formatDate } from "@/lib/format";
import { isPremiumUser } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/shared/UserAvatar";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function validate(values, isVendor) {
  const errors = {};

  const name = values.name.trim();
  if (name.length < 2 || name.length > 60) {
    errors.name = "Name must be 2 to 60 characters";
  }

  if (isVendor) {
    const business = values.businessName.trim();
    if (business.length < 2 || business.length > 100) {
      errors.businessName = "Business name must be 2 to 100 characters";
    }
  }

  const phone = values.phone.trim();
  if (phone && !/^[+0-9()\-\s]{7,20}$/.test(phone)) {
    errors.phone = "Enter a valid phone number";
  }

  if (values.address.trim().length > 200) {
    errors.address = "Address must be 200 characters or less";
  }

  return errors;
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function ProfileFormInner({ user, refetch }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const isVendor = user.role === "vendor";

  const [values, setValues] = useState({
    name: user.name || "",
    businessName: user.businessName || "",
    phone: user.phone || "",
    address: user.address || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Free the browser memory used by the local preview
  const previewRef = useRef("");
  useEffect(() => {
    previewRef.current = imagePreview;
  }, [imagePreview]);
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const avatarSrc = imagePreview || (removeImage ? "" : user.image || "");

  const dirty =
    values.name.trim() !== (user.name || "") ||
    (isVendor && values.businessName.trim() !== (user.businessName || "")) ||
    values.phone.trim() !== (user.phone || "") ||
    values.address.trim() !== (user.address || "") ||
    Boolean(imageFile) ||
    removeImage;

  const updateField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const clearPreview = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, WebP or GIF images are allowed");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be smaller than 4 MB");
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleRemovePhoto = () => {
    clearPreview();
    setRemoveImage(Boolean(user.image));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = validate(values, isVendor);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Send only what changed
    const body = {};
    if (values.name.trim() !== (user.name || "")) body.name = values.name.trim();
    if (isVendor && values.businessName.trim() !== (user.businessName || "")) {
      body.businessName = values.businessName.trim();
    }
    if (values.phone.trim() !== (user.phone || "")) body.phone = values.phone.trim();
    if (values.address.trim() !== (user.address || "")) {
      body.address = values.address.trim();
    }

    setLoading(true);
    try {
      if (imageFile) {
        body.image = await uploadImage(imageFile);
      } else if (removeImage) {
        body.image = null;
      }

      const result = await apiFetch("/api/profile", {
        method: "PATCH",
        body,
      });

      // Reload the session so the Navbar and dashboard header update instantly
      await refetch();
      router.refresh();

      clearPreview();
      setRemoveImage(false);
      toast.success(result.message || "Profile updated successfully");
    } catch (error) {
      toast.error(error.message || "Could not update your profile");
    } finally {
      setLoading(false);
    }
  };

  const premium = isPremiumUser(user);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Photo */}
            <div className="flex flex-wrap items-center gap-5">
              <UserAvatar
                user={{ name: values.name || user.name, image: avatarSrc }}
                className="h-20 w-20 text-xl"
              />
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFile}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                    {avatarSrc ? "Change photo" : "Upload photo"}
                  </Button>
                  {avatarSrc && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      onClick={handleRemovePhoto}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove photo
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG, WebP or GIF, up to 4 MB.
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => updateField("name", e.target.value)}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Business name (vendors) */}
            {isVendor && (
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={values.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  disabled={loading}
                />
                {errors.businessName && (
                  <p className="text-sm text-destructive">
                    {errors.businessName}
                  </p>
                )}
              </div>
            )}

            {/* Email (read only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled readOnly />
              <p className="text-xs text-muted-foreground">
                Your email address cannot be changed.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. +880 1712-345678"
                value={values.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address (optional)</Label>
              <Textarea
                id="address"
                rows={3}
                placeholder="Your city or full address"
                value={values.address}
                onChange={(e) => updateField("address", e.target.value)}
                disabled={loading}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span />
                <span>{values.address.length}/200</span>
              </div>
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>

            <div className="border-t pt-6">
              <Button type="submit" disabled={loading || !dirty}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Read-only account info */}
      <Card className="h-fit">
        <CardContent className="p-5">
          <h2 className="font-heading text-lg font-semibold">Account</h2>
          <dl className="mt-2 divide-y">
            <InfoRow label="Role">
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </InfoRow>
            {isVendor && (
              <InfoRow label="Plan">
                <Badge
                  className={
                    premium ? "bg-accent text-accent-foreground" : ""
                  }
                  variant={premium ? "default" : "outline"}
                >
                  {premium ? "Premium" : "Free"}
                </Badge>
              </InfoRow>
            )}
            <InfoRow label="Member since">{formatDate(user.createdAt)}</InfoRow>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Your role and plan cannot be changed from this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfileForm() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  if (isPending || !user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // key makes sure the form restarts if a different user is logged in
  return <ProfileFormInner key={user.id} user={user} refetch={refetch} />;
}

