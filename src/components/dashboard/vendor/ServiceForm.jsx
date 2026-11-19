"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { uploadImage } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function validate(values, imageCount) {
  const errors = {};

  const name = values.serviceName.trim();
  if (name.length < 3 || name.length > 100) {
    errors.serviceName = "Service name must be 3 to 100 characters";
  }

  if (!SERVICE_CATEGORIES.includes(values.category)) {
    errors.category = "Please choose a category";
  }

  const description = values.description.trim();
  if (description.length < 10 || description.length > 2000) {
    errors.description = "Description must be 10 to 2000 characters";
  }

  const price = Number(values.price);
  if (!values.price || !Number.isFinite(price) || price <= 0 || price > 10000000) {
    errors.price = "Enter a price greater than 0";
  }

  const location = values.location.trim();
  if (location.length < 2 || location.length > 100) {
    errors.location = "Location must be 2 to 100 characters";
  }

  if (imageCount < 1) {
    errors.images = "Add at least one image";
  }

  return errors;
}

// Props:
//   initialService  (optional) existing service, used later for editing
//   onSubmit(values) async function that saves the service (it may throw)
//   submitLabel     text of the submit button
//   cancelHref      where the Cancel button goes
export default function ServiceForm({
  initialService,
  onSubmit,
  submitLabel = "Submit Service",
  cancelHref = "/dashboard/vendor/services",
}) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [values, setValues] = useState({
    serviceName: initialService?.serviceName ?? "",
    category: initialService?.category ?? "",
    description: initialService?.description ?? "",
    price: initialService?.price != null ? String(initialService.price) : "",
    location: initialService?.location ?? "",
  });
  // Each image is { id, url?, file?, preview }.
  // Existing/uploaded images have a url. New ones have a file until uploaded.
  const [images, setImages] = useState(() =>
    (initialService?.images ?? []).map((url, index) => ({
      id: `existing-${index}`,
      url,
      preview: url,
    }))
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Free the browser memory used by local previews when leaving the page
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        if (image.file) URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  const updateField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      toast.error(`You can add up to ${MAX_IMAGES} images`);
      return;
    }

    const accepted = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG, WebP or GIF images are allowed`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} is larger than 4 MB`);
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length > room) {
      toast.error(`Only ${room} more image${room === 1 ? "" : "s"} can be added`);
    }

    const toAdd = accepted.slice(0, room).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    if (toAdd.length > 0) {
      setImages((prev) => [...prev, ...toAdd]);
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const removeImage = (id) => {
    const target = images.find((image) => image.id === id);
    if (target?.file) URL.revokeObjectURL(target.preview);
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = validate(values, images.length);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload the new images one by one (already-uploaded ones are skipped)
      const urls = [];
      const totalToUpload = images.filter((image) => !image.url).length;
      let uploaded = 0;

      for (const image of images) {
        if (image.url) {
          urls.push(image.url);
          continue;
        }
        uploaded += 1;
        setStatus(`Uploading image ${uploaded} of ${totalToUpload}...`);
        const url = await uploadImage(image.file);
        urls.push(url);
        // Remember it, so a retry does not upload it again
        setImages((prev) =>
          prev.map((item) => (item.id === image.id ? { ...item, url } : item))
        );
      }

      // 2. Save the service
      setStatus("Saving service...");
      await onSubmit({
        serviceName: values.serviceName.trim(),
        category: values.category,
        description: values.description.trim(),
        price: Number(values.price),
        location: values.location.trim(),
        images: urls,
      });
    } catch (error) {
      if (error.status === 403 && /free plan/i.test(error.message)) {
        toast.error(error.message, {
          action: {
            label: "Upgrade",
            onClick: () => router.push("/dashboard/vendor/subscription"),
          },
        });
      } else {
        toast.error(error.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <Card>
      <CardContent className="p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="serviceName">Service Name</Label>
            <Input
              id="serviceName"
              placeholder="e.g. Royal Wedding Photography"
              value={values.serviceName}
              onChange={(e) => updateField("serviceName", e.target.value)}
              disabled={loading}
            />
            {errors.serviceName && (
              <p className="text-sm text-destructive">{errors.serviceName}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Service Category</Label>
            <select
              id="category"
              className={selectClass}
              value={values.category}
              onChange={(e) => updateField("category", e.target.value)}
              disabled={loading}
            >
              <option value="">Choose a category</option>
              {SERVICE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Describe what is included, your experience and anything customers should know."
              value={values.description}
              onChange={(e) => updateField("description", e.target.value)}
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{errors.description ? "" : "10 to 2000 characters"}</span>
              <span>{values.description.length}/2000</span>
            </div>
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Price and location */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                inputMode="decimal"
                min="1"
                step="any"
                placeholder="e.g. 1500"
                value={values.price}
                onChange={(e) => updateField("price", e.target.value)}
                disabled={loading}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Dhaka"
                value={values.location}
                onChange={(e) => updateField("location", e.target.value)}
                disabled={loading}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Service Images</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFiles}
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.preview}
                    alt={`Service image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                      Cover
                    </span>
                  )}
                  {!loading && (
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      aria-label={`Remove image ${index + 1}`}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">Add image</span>
                </button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Add 1 to {MAX_IMAGES} images (JPG, PNG, WebP or GIF, up to 4 MB
              each). The first image is the cover shown on service cards.
            </p>
            {errors.images && (
              <p className="text-sm text-destructive">{errors.images}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 border-t pt-6">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? status || "Please wait..." : submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              nativeButton={false}
              render={<Link href={cancelHref} />}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
