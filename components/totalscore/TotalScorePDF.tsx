import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { PHETSARATH_LAO_BASE64 } from "@/lib/Phetsarath-font";

// Register Phetsarath OT Font (Official Lao National Standard Font)
try {
  Font.register({
    family: "PhetsarathOT",
    fonts: [
      {
        src: `data:font/truetype;base64,${PHETSARATH_LAO_BASE64}`,
      },
    ],
  });
} catch (e) {
  console.warn("Font registration failed:", e);
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "PhetsarathOT",
    fontSize: 7.5,
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0284c7",
    borderBottomStyle: "solid",
    paddingBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  userInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    fontSize: 8,
    color: "#334155",
    backgroundColor: "#f8fafc",
    padding: 6,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  userInfoItem: {
    marginRight: 12,
  },
  userInfoLabel: {
    color: "#64748b",
  },
  userInfoVal: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  groupSection: {
    marginTop: 10,
  },
  groupTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0369a1",
    marginBottom: 3,
  },
  table: {
    width: "100%",
    borderWidth: 0.5,
    borderColor: "#cbd5e1",
    borderStyle: "solid",
    borderRadius: 3,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0369a1",
    color: "#ffffff",
    paddingVertical: 3.5,
    fontSize: 6.5,
    fontWeight: "bold",
    textAlign: "center",
    alignItems: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    fontSize: 6.5,
    alignItems: "center",
    textAlign: "center",
  },
  tableRowSummary: {
    backgroundColor: "#f1f5f9",
    fontWeight: "bold",
  },
  // Column Widths
  colGiver: { width: "14%", textAlign: "left", paddingLeft: 4 },
  colCode: { width: "6%" },
  colSub: { width: "3.2%" },
  colSubSum: { width: "4.5%", backgroundColor: "#e2e8f0", fontWeight: "bold" },
  colTotal: { width: "5%", backgroundColor: "#e0f2fe", color: "#0369a1", fontWeight: "bold" },
  colPercent: { width: "5%", backgroundColor: "#fef3c7", color: "#b45309", fontWeight: "bold" },

  footer: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#94a3b8",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 3,
  },
});

export interface TotalScorePDFProps {
  selectedUser: {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    emp_code?: string | null;
    department?: { department_name?: string | null } | null;
    position?: { pos_name?: string | null } | null;
  };
  groupedResult: Record<string, any>;
  getRoleItems: (val: any) => any[];
}

export function TotalScorePDFDocument({
  selectedUser,
  groupedResult,
  getRoleItems,
}: TotalScorePDFProps) {
  const roleKeys = Object.keys(groupedResult).filter(
    (key) => key !== "_weightedCalculation"
  );

  return (
    <Document title={`Evaluation_${selectedUser.emp_code || "Result"}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            ຜົນການປະເມີນ 360 - ລາຍລະອຽດຄະແນນບຸກຄົນ
          </Text>

          {/* User Info Bar */}
          <View style={styles.userInfoGrid}>
            <Text style={styles.userInfoItem}>
              <Text style={styles.userInfoLabel}>ຊື່ ແລະ ນາມສະກຸນ: </Text>
              <Text style={styles.userInfoVal}>
                {selectedUser.first_name || ""} {selectedUser.last_name || ""}
              </Text>
            </Text>
            <Text style={styles.userInfoItem}>
              <Text style={styles.userInfoLabel}>ລະຫັດພະນັກງານ: </Text>
              <Text style={styles.userInfoVal}>
                {selectedUser.emp_code || `EMP-${selectedUser.id}`}
              </Text>
            </Text>
            {selectedUser.department?.department_name && (
              <Text style={styles.userInfoItem}>
                <Text style={styles.userInfoLabel}>ພາກສ່ວນ: </Text>
                <Text style={styles.userInfoVal}>
                  {selectedUser.department.department_name}
                </Text>
              </Text>
            )}
            {selectedUser.position?.pos_name && (
              <Text style={styles.userInfoItem}>
                <Text style={styles.userInfoLabel}>ຕຳແໜ່ງ: </Text>
                <Text style={styles.userInfoVal}>
                  {selectedUser.position.pos_name}
                </Text>
              </Text>
            )}
          </View>
        </View>

        {/* Tables per role group */}
        {roleKeys.map((roleName) => {
          const items = getRoleItems(groupedResult[roleName]);
          if (!items || items.length === 0) return null;

          const count = items.length;
          const avgS1 = (
            items.reduce((s: number, i: any) => s + (i.s1_score || 0), 0) / count
          ).toFixed(2);
          const avgS2 = (
            items.reduce((s: number, i: any) => s + (i.s2_score || 0), 0) / count
          ).toFixed(2);
          const avgS3 = (
            items.reduce((s: number, i: any) => s + (i.s3_score || 0), 0) / count
          ).toFixed(2);
          const avgS4 = (
            items.reduce((s: number, i: any) => s + (i.s4_score || 0), 0) / count
          ).toFixed(2);
          const avgTotal = (
            items.reduce((s: number, i: any) => s + (i.total_score || 0), 0) / count
          ).toFixed(2);
          const avgPercent = (
            items.reduce((s: number, i: any) => s + (i.percent_score || 0), 0) / count
          ).toFixed(2);

          return (
            <View key={roleName} style={styles.groupSection} wrap={false}>
              <Text style={styles.groupTitle}>
                ກຸ່ມ: {roleName} ({items.length} ທ່ານ)
              </Text>

              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={styles.colGiver}>ຜູ້ປະເມີນ</Text>
                  <Text style={styles.colCode}>ລະຫັດ</Text>
                  <Text style={styles.colSub}>1.1</Text>
                  <Text style={styles.colSub}>1.2</Text>
                  <Text style={styles.colSub}>1.3</Text>
                  <Text style={styles.colSub}>1.4</Text>
                  <Text style={styles.colSub}>1.5</Text>
                  <Text style={styles.colSub}>1.6</Text>
                  <Text style={styles.colSubSum}>ລວມ I</Text>

                  <Text style={styles.colSub}>2.1</Text>
                  <Text style={styles.colSub}>2.2</Text>
                  <Text style={styles.colSub}>2.3</Text>
                  <Text style={styles.colSub}>2.4</Text>
                  <Text style={styles.colSub}>2.5</Text>
                  <Text style={styles.colSubSum}>ລວມ II</Text>

                  <Text style={styles.colSub}>3.1</Text>
                  <Text style={styles.colSub}>3.2</Text>
                  <Text style={styles.colSub}>3.3</Text>
                  <Text style={styles.colSubSum}>ລວມ III</Text>

                  <Text style={styles.colSub}>4.1</Text>
                  <Text style={styles.colSub}>4.2</Text>
                  <Text style={styles.colSubSum}>ລວມ IV</Text>

                  <Text style={styles.colTotal}>ລວມ</Text>
                  <Text style={styles.colPercent}>ສະເລ່ຍ(%)</Text>
                </View>

                {/* Items */}
                {items.map((item: any, idx: number) => {
                  const giverName = item.giver
                    ? `${item.giver.first_name || ""} ${item.giver.last_name || ""}`.trim()
                    : "ຜູ້ປະເມີນ";

                  return (
                    <View key={item.id || idx} style={styles.tableRow}>
                      <Text style={styles.colGiver}>{giverName}</Text>
                      <Text style={styles.colCode}>{item.giver?.emp_code || "-"}</Text>
                      <Text style={styles.colSub}>{item.s1_1 ?? 0}</Text>
                      <Text style={styles.colSub}>{item.s1_2 ?? 0}</Text>
                      <Text style={styles.colSub}>{item.s1_3 ?? 0}</Text>
                      <Text style={styles.colSub}>{item.s1_4 ?? 0}</Text>
                      <Text style={styles.colSub}>{item.s1_5 ?? 0}</Text>
                      <Text style={styles.colSub}>{item.s1_6 ?? 0}</Text>
                      <Text style={styles.colSubSum}>{item.s1_score ?? 0}</Text>

                      <Text style={styles.colSub}>{item.s2_1 ?? 0}</Text>
                      <Text style={styles.colSub}>{item.s2_2 ?? 0}</Text>
                      <Text style={styles.colSub}>{item.s2_3 ?? 0}</Text>
                      <Text style={styles.colSub}>{item.s2_4 ?? 0}</Text>
                      <Text style={styles.colSub}>{item.s2_5 ?? 0}</Text>
                      <Text style={styles.colSubSum}>{item.s2_score ?? 0}</Text>

                      <Text style={styles.colSub}>{item.s3_1 ?? 0}</Text>
                      <Text style={styles.colSub}>{item.s3_2 ?? 0}</Text>
                      <Text style={styles.colSub}>{item.s3_3 ?? 0}</Text>
                      <Text style={styles.colSubSum}>{item.s3_score ?? 0}</Text>

                      <Text style={styles.colSub}>{item.s4_1 ?? 0}</Text>
                      <Text style={styles.colSub}>{item.s4_2 ?? 0}</Text>
                      <Text style={styles.colSubSum}>{item.s4_score ?? 0}</Text>

                      <Text style={styles.colTotal}>{item.total_score ?? 0}</Text>
                      <Text style={styles.colPercent}>
                        {item.percent_score != null ? `${item.percent_score}%` : "-"}
                      </Text>
                    </View>
                  );
                })}

                {/* Group Summary Row */}
                <View style={[styles.tableRow, styles.tableRowSummary]}>
                  <Text style={styles.colGiver}>ສະເລ່ຍກຸ່ມ</Text>
                  <Text style={styles.colCode}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSubSum}>{avgS1}</Text>

                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSubSum}>{avgS2}</Text>

                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSubSum}>{avgS3}</Text>

                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSub}>-</Text>
                  <Text style={styles.colSubSum}>{avgS4}</Text>

                  <Text style={styles.colTotal}>{avgTotal}</Text>
                  <Text style={styles.colPercent}>{avgPercent}%</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Page Footer */}
        <View style={styles.footer} fixed>
          <Text>ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL) - ລະບົບປະເມີນຜົນການປະຕິບັດງານ</Text>
          <Text render={({ pageNumber, totalPages }: any) => `ໜ້າ ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
