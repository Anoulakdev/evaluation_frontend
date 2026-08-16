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
    width: "5%",
    textAlign: "center",
  },
  colCode: {
    width: "10%",
    textAlign: "center",
  },
  colName: {
    width: "20%",
    paddingLeft: 4,
    textAlign: "left",
  },
  colPos: {
    width: "18%",
    paddingLeft: 4,
    textAlign: "left",
  },
  colRole: {
    width: "17%",
    paddingLeft: 4,
    textAlign: "left",
  },
  colDept: {
    width: "20%",
    paddingLeft: 4,
    textAlign: "left",
  },
  colScore: {
    width: "10%",
    textAlign: "center",
    fontWeight: "bold",
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

export interface AllTotalScorePDFProps {
  data: Array<{
    receiverId: number;
    emp_code: string | null;
    first_name: string | null;
    last_name: string | null;
    posName?: string | null;
    roleName: string;
    deptDivText: string;
    breakdownText?: string;
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
            <Text style={styles.colRole}>ບົດບາດ</Text>
            <Text style={styles.colDept}>ພາກສ່ວນ</Text>
            <Text style={styles.colScore}>ຄະແນນສຸດທິ</Text>
          </View>

          {/* Table Body Rows */}
          {data.map((item, idx) => {
            const isEven = idx % 2 === 1;
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
                <Text style={styles.colRole}>{item.roleName}</Text>
                <Text style={styles.colDept}>{item.deptDivText}</Text>
                <Text style={styles.colScore}>{item.finalTotal}%</Text>
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
