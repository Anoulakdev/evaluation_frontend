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
    fontSize: 8,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0284c7",
    borderBottomStyle: "solid",
    paddingBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#64748b",
    fontSize: 8.5,
  },
  table: {
    width: "100%",
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderStyle: "solid",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0369a1",
    color: "#ffffff",
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontWeight: "bold",
    fontSize: 8,
    alignItems: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4.5,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    alignItems: "center",
    fontSize: 7.5,
  },
  tableRowEven: {
    backgroundColor: "#f8fafc",
  },
  colIdx: {
    width: "3.5%",
    textAlign: "center",
  },
  colCode: {
    width: "7.5%",
    textAlign: "center",
  },
  colName: {
    width: "14%",
    paddingLeft: 3,
    textAlign: "left",
  },
  colPos: {
    width: "12%",
    paddingLeft: 3,
    textAlign: "left",
  },
  colDept: {
    width: "15%",
    paddingLeft: 3,
    textAlign: "left",
  },
  colBreakdown: {
    width: "41%",
    paddingHorizontal: 4,
    textAlign: "left",
  },
  colScore: {
    width: "7%",
    textAlign: "center",
    fontWeight: "bold",
  },
  colScoreText: {
    width: "7%",
    textAlign: "center",
    fontWeight: "bold",
    color: "#0369a1",
  },
  breakdownWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingVertical: 1,
  },
  breakdownBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 0.5,
    borderColor: "#cbd5e1",
    borderRadius: 3,
    paddingHorizontal: 3.5,
    paddingVertical: 1.5,
    marginRight: 2.5,
    marginBottom: 2,
    marginTop: 1,
  },
  breakdownLabel: {
    fontSize: 6,
    color: "#475569",
  },
  breakdownScore: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#0369a1",
  },
  emptyBreakdown: {
    color: "#94a3b8",
    fontSize: 7.5,
  },
  footer: {
    position: "absolute",
    bottom: 12,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: "#94a3b8",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 4,
  },
});

interface BreakdownItem {
  label: string;
  score: string;
}

function parseBreakdown(
  breakdownText?: string,
  breakdownGroups?: Array<{ label?: string; weighted_score?: number }>,
): BreakdownItem[] {
  if (breakdownGroups && breakdownGroups.length > 0) {
    return breakdownGroups
      .filter((g) => g && (g.label || g.weighted_score !== undefined))
      .map((g) => ({
        label: g.label || "",
        score: g.weighted_score !== undefined ? `${g.weighted_score}%` : "",
      }));
  }

  if (!breakdownText || breakdownText.trim() === "-" || !breakdownText.trim()) {
    return [];
  }

  return breakdownText
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const colonIdx = part.lastIndexOf(":");
      if (colonIdx !== -1) {
        return {
          label: part.substring(0, colonIdx).trim(),
          score: part.substring(colonIdx + 1).trim(),
        };
      }
      return {
        label: part,
        score: "",
      };
    });
}

export interface AllTotalScorePDFProps {
  data: Array<{
    receiverId: number;
    emp_code: string | null;
    first_name: string | null;
    last_name: string | null;
    posName?: string | null;
    roleName?: string;
    deptDivText: string;
    breakdownText?: string;
    breakdownGroups?: Array<{
      label?: string;
      weighted_score?: number;
      weight_percent?: number;
    }>;
    finalTotal: number;
  }>;
  reportDate: string;
  departmentFilterName?: string;
}

export function AllTotalScorePDFDocument({
  data,
  reportDate,
  departmentFilterName,
}: AllTotalScorePDFProps) {
  return (
    <Document title="EDL_Evaluation_Overall_Report">
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            ລາຍງານຜົນການປະເມີນການປະຕິບັດງານລວມ
          </Text>
          <View style={styles.subtitleRow}>
            <Text>
              ວັນທີອອກລາຍງານ: {reportDate}
              {departmentFilterName ? ` | ພາກສ່ວນ: ${departmentFilterName}` : ""}
            </Text>
            <Text>ຈຳນວນພະນັກງານທັງໝົດ: {data.length} ທ່ານ</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Head */}
          <View style={styles.tableHeader}>
            <Text style={styles.colIdx}>ລ/ດ</Text>
            <Text style={styles.colCode}>ລະຫັດ</Text>
            <Text style={styles.colName}>ຊື່ ແລະ ນາມສະກຸນ</Text>
            <Text style={styles.colPos}>ຕຳແໜ່ງ</Text>
            <Text style={styles.colDept}>ພາກສ່ວນ</Text>
            <Text style={styles.colBreakdown}>ສັດສ່ວນເປີເຊັນ</Text>
            <Text style={styles.colScore}>ຄະແນນສຸດທິ</Text>
          </View>

          {/* Table Body Rows */}
          {data.map((item, idx) => {
            const isEven = idx % 2 === 1;
            const breakdownItems = parseBreakdown(
              item.breakdownText,
              item.breakdownGroups,
            );

            return (
              <View
                key={item.receiverId || idx}
                style={[styles.tableRow, isEven ? styles.tableRowEven : {}]}
                wrap={false}
              >
                <Text style={styles.colIdx}>{idx + 1}</Text>
                <Text style={styles.colCode}>{item.emp_code || "-"}</Text>
                <Text style={styles.colName}>
                  {`${item.first_name || ""} ${item.last_name || ""}`.trim()}
                </Text>
                <Text style={styles.colPos}>{item.posName || "-"}</Text>
                <Text style={styles.colDept}>{item.deptDivText}</Text>
                <View style={styles.colBreakdown}>
                  {breakdownItems.length === 0 ? (
                    <Text style={styles.emptyBreakdown}>-</Text>
                  ) : (
                    <View style={styles.breakdownWrapper}>
                      {breakdownItems.map((b, bIdx) => (
                        <View key={bIdx} style={styles.breakdownBadge}>
                          <Text style={styles.breakdownLabel}>{b.label}:</Text>
                          {b.score ? (
                            <Text style={styles.breakdownScore}>
                              {" "}{b.score}
                            </Text>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <Text style={styles.colScoreText}>{item.finalTotal}%</Text>
              </View>
            );
          })}
        </View>

        {/* Page Footer */}
        <View style={styles.footer} fixed>
          <Text>ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL) - ລະບົບປະເມີນຜົນການປະຕິບັດງານ</Text>
          <Text render={({ pageNumber, totalPages }: any) => `ໜ້າ ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
