import OAuthCallbackClient from "./OAuthCallbackClient";

export function generateStaticParams() {
  return [{ provider: "google" }, { provider: "facebook" }];
}

export default function OAuthCallbackPage() {
  return <OAuthCallbackClient />;
}
