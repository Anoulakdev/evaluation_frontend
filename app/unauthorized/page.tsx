import { UnauthorizedView } from "@/components/unauthorized/UnauthorizedView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ບໍ່ມີສິດເຂົ້າເຖິງ (Unauthorized) | EDL Evaluation",
  description: "ທ່ານບໍ່ມີສິດທິໃນການເຂົ້າເຖິງໜ້ານີ້",
};

export default function UnauthorizedPage() {
  return <UnauthorizedView />;
}
