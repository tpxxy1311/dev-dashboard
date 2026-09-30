// src/components/ui/pageHeadline.tsx
import { requireUser } from "@/server/session";
import PageGreeting from "./pageGreeting";

const PageHeadline = async () => {
  const user = await requireUser();
  return <PageGreeting name={user.name} />;
};

export default PageHeadline;
