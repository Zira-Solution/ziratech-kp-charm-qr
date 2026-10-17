import { redirect } from "next/navigation";

/**
 * The standalone /create page has been deprecated in favor of /gift.
 * Users entering /create are instantly redirected to /gift.
 */
export default function CreateRedirectPage() {
  redirect("/gift");
}
