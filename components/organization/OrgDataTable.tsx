"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {
  Building2,
  Search,
  RefreshCw,
  AlertCircle,
  Plus,
  Edit2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryMeta } from "./OrgCategoryCard";

export interface GenericOrgItem {
  id: number;
  code?: string;
  name: string;
  detail?: string;
  parentId?: number;
  parentName?: string;
  shortName?: string;
  branchId?: number;
  divisionId?: number;
  divisionName?: string;
  officeId?: number;
  officeName?: string;
  unitType?: string;
}

interface OrgDataTableProps {
  activeMeta: CategoryMeta;
  activeCategory: string;
  items: GenericOrgItem[];
  filteredItems: GenericOrgItem[];
  loading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  errorMsg: string;
  onOpenCreateDept?: () => void;
  onOpenEditDept?: (item: GenericOrgItem) => void;
  onOpenCreateDivision?: () => void;
  onOpenEditDivision?: (item: GenericOrgItem) => void;
  onOpenCreateOffice?: () => void;
  onOpenEditOffice?: (item: GenericOrgItem) => void;
  onOpenCreateUnit?: () => void;
  onOpenEditUnit?: (item: GenericOrgItem) => void;
  departmentFilterOptions?: { id: number; name: string }[];
  selectedDeptFilter?: number | "";
  onDeptFilterChange?: (deptId: number | "") => void;
  divisionFilterOptions?: { id: number; name: string }[];
  selectedDivisionFilter?: number | "";
  onDivisionFilterChange?: (divisionId: number | "") => void;

  // Unit Cascading Filter Options (Department -> Division -> Office)
  unitDeptFilterOptions?: { id: number; name: string }[];
  selectedUnitDeptFilter?: number | "";
  onUnitDeptFilterChange?: (deptId: number | "") => void;
  unitDivisionFilterOptions?: { id: number; name: string }[];
  selectedUnitDivisionFilter?: number | "";
  onUnitDivisionFilterChange?: (divisionId: number | "") => void;
  unitOfficeFilterOptions?: { id: number; name: string }[];
  selectedUnitOfficeFilter?: number | "";
  onUnitOfficeFilterChange?: (officeId: number | "") => void;
}

export function OrgDataTable({
  activeMeta,
  activeCategory,
  items,
  loading,
  search,
  onSearchChange,
  errorMsg,
  onOpenCreateDept,
  onOpenEditDept,
  onOpenCreateDivision,
  onOpenEditDivision,
  onOpenCreateOffice,
  onOpenEditOffice,
  onOpenCreateUnit,
  onOpenEditUnit,
  departmentFilterOptions,
  selectedDeptFilter,
  onDeptFilterChange,
  divisionFilterOptions,
  selectedDivisionFilter,
  onDivisionFilterChange,
  unitDeptFilterOptions,
  selectedUnitDeptFilter,
  onUnitDeptFilterChange,
  unitDivisionFilterOptions,
  selectedUnitDivisionFilter,
  onUnitDivisionFilterChange,
  unitOfficeFilterOptions,
  selectedUnitOfficeFilter,
  onUnitOfficeFilterChange,
}: OrgDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Columns definition using TanStack Table ColumnDef
  const columns = useMemo<ColumnDef<GenericOrgItem>[]>(() => {
    const baseCols: ColumnDef<GenericOrgItem>[] = [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-extrabold uppercase hover:text-sky-700 transition-colors"
          >
            # ID
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <span className="font-mono text-slate-500 font-medium">
            #{info.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-extrabold uppercase hover:text-sky-700 transition-colors"
          >
            ລະຫັດ (Code)
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => {
          const val = info.getValue<string | undefined>();
          return val ? (
            <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 text-[11px]">
              {val}
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          );
        },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-extrabold uppercase hover:text-sky-700 transition-colors"
          >
            ຊື່{activeMeta.titleLao} (Name)
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </button>
        ),
        cell: (info) => (
          <span className="font-bold text-slate-800">
            {info.getValue<string>()}
          </span>
        ),
      },
    ];

    if (activeCategory === "division") {
      baseCols.push({
        id: "departmentName",
        accessorFn: (row) => row.parentName || "",
        header: "ຝ່າຍທີ່ສັງກັດ (Department)",
        cell: (info) => {
          const row = info.row.original;
          const val = row.parentId;
          return val || row.parentName ? (
            <span className="font-medium text-slate-600">
              {row.parentName ? (
                <span className="font-semibold text-slate-700">{row.parentName}</span>
              ) : (
                <span className="font-mono text-slate-500">#{val}</span>
              )}
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          );
        },
      });
    } else if (activeCategory === "office") {
      baseCols.push({
        id: "divisionName",
        accessorFn: (row) => row.parentName || "",
        header: "ພະແນກ/ສາຂາທີ່ສັງກັດ (Division)",
        cell: (info) => {
          const row = info.row.original;
          const val = row.parentId;
          return val || row.parentName ? (
            <span className="font-medium text-slate-600">
              {row.parentName ? (
                <span className="font-semibold text-slate-700">{row.parentName}</span>
              ) : (
                <span className="font-mono text-slate-500">#{val}</span>
              )}
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          );
        },
      });
    } else if (activeCategory === "unit") {
      baseCols.push({
        id: "divisionName",
        accessorFn: (row) => row.divisionName || (row.divisionId ? row.parentName : "") || "",
        header: "ພະແນກ/ສາຂາທີ່ສັງກັດ (Division)",
        cell: (info) => {
          const row = info.row.original;
          const divName = row.divisionName || (row.divisionId ? row.parentName : undefined);
          return divName ? (
            <span className="font-semibold text-slate-700">{divName}</span>
          ) : (
            <span className="text-slate-400">-</span>
          );
        },
      });
      baseCols.push({
        id: "officeName",
        accessorFn: (row) => row.officeName || (row.officeId ? row.parentName : "") || "",
        header: "ຫ້ອງການທີ່ສັງກັດ (Office)",
        cell: (info) => {
          const row = info.row.original;
          const offName = row.officeName || (row.officeId ? row.parentName : undefined);
          return offName ? (
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[11px]">
              {offName}
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          );
        },
      });
    }

    baseCols.push({
      id: "actions",
      header: () => <div className="text-right">ຈັດການ</div>,
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="text-right">
            {activeCategory === "department" && onOpenEditDept ? (
              <button
                onClick={() => onOpenEditDept(row)}
                className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold border border-sky-200 flex items-center gap-1 ml-auto transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>ແກ້ໄຂ</span>
              </button>
            ) : activeCategory === "division" && onOpenEditDivision ? (
              <button
                onClick={() => onOpenEditDivision(row)}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 flex items-center gap-1 ml-auto transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>ແກ້ໄຂ</span>
              </button>
            ) : activeCategory === "office" && onOpenEditOffice ? (
              <button
                onClick={() => onOpenEditOffice(row)}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 flex items-center gap-1 ml-auto transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>ແກ້ໄຂ</span>
              </button>
            ) : activeCategory === "unit" && onOpenEditUnit ? (
              <button
                onClick={() => onOpenEditUnit(row)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200 flex items-center gap-1 ml-auto transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                <span>ແກ້ໄຂ</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ໃຊ້ງານຢູ່
              </span>
            )}
          </div>
        );
      },
    });

    return baseCols;
  }, [activeCategory, activeMeta.titleLao, onOpenEditDept, onOpenEditDivision, onOpenEditOffice, onOpenEditUnit]);

  // TanStack Table Instance
  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
      globalFilter: search,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: onSearchChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-3.5 font-sans">
      {/* Section Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeMeta.badgeColor}`}
          >
            <activeMeta.icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <span>ລາຍຊື່ {activeMeta.titleLao} ({activeMeta.titleEng})</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {table.getFilteredRowModel().rows.length} ລາຍການ
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Create Department Button */}
          {activeCategory === "department" && onOpenCreateDept && (
            <Button
              variant="edl"
              size="sm"
              onClick={onOpenCreateDept}
              className="text-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>ເພີ່ມຝ່າຍ</span>
            </Button>
          )}

          {/* Create Division Button */}
          {activeCategory === "division" && onOpenCreateDivision && (
            <Button
              variant="edl"
              size="sm"
              onClick={onOpenCreateDivision}
              className="text-xs shrink-0 bg-indigo-600 hover:bg-indigo-500"
            >
              <Plus className="w-4 h-4" />
              <span>ເພີ່ມພະແນກ</span>
            </Button>
          )}

          {/* Create Office Button */}
          {activeCategory === "office" && onOpenCreateOffice && (
            <Button
              variant="edl"
              size="sm"
              onClick={onOpenCreateOffice}
              className="text-xs shrink-0 bg-emerald-600 hover:bg-emerald-500"
            >
              <Plus className="w-4 h-4" />
              <span>ເພີ່ມຫ້ອງການ</span>
            </Button>
          )}

          {/* Create Unit Button */}
          {activeCategory === "unit" && onOpenCreateUnit && (
            <Button
              variant="edl"
              size="sm"
              onClick={onOpenCreateUnit}
              className="text-xs shrink-0 bg-amber-600 hover:bg-amber-500"
            >
              <Plus className="w-4 h-4" />
              <span>ເພີ່ມໜ່ວຍງານ</span>
            </Button>
          )}

          {/* Department Filter Dropdown for Division category */}
          {activeCategory === "division" &&
            departmentFilterOptions &&
            onDeptFilterChange && (
              <select
                value={selectedDeptFilter}
                onChange={(e) =>
                  onDeptFilterChange(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none font-medium text-slate-700 h-9 max-w-[220px] truncate"
              >
                <option value="">-- ຝ່າຍທັງໝົດ --</option>
                {departmentFilterOptions.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}

          {/* Division Filter Dropdown for Office category */}
          {activeCategory === "office" &&
            divisionFilterOptions &&
            onDivisionFilterChange && (
              <select
                value={selectedDivisionFilter}
                onChange={(e) =>
                  onDivisionFilterChange(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none font-medium text-slate-700 h-9 max-w-[220px] truncate"
              >
                <option value="">-- ພະແນກ/ສາຂາທັງໝົດ --</option>
                {divisionFilterOptions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            )}

          {/* Cascading Filters for Unit category (Department -> Division -> Office) */}
          {activeCategory === "unit" && (
            <>
              {unitDeptFilterOptions && onUnitDeptFilterChange && (
                <select
                  value={selectedUnitDeptFilter}
                  onChange={(e) =>
                    onUnitDeptFilterChange(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none font-medium text-slate-700 h-9 max-w-[170px] truncate"
                >
                  <option value="">-- ຝ່າຍທັງໝົດ --</option>
                  {unitDeptFilterOptions.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}

              {unitDivisionFilterOptions && onUnitDivisionFilterChange && (
                <select
                  value={selectedUnitDivisionFilter}
                  onChange={(e) =>
                    onUnitDivisionFilterChange(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none font-medium text-slate-700 h-9 max-w-[170px] truncate disabled:opacity-50"
                >
                  <option value="">-- ພະແນກ/ສາຂາທັງໝົດ --</option>
                  {unitDivisionFilterOptions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name}
                    </option>
                  ))}
                </select>
              )}

              {unitOfficeFilterOptions && onUnitOfficeFilterChange && (
                <select
                  value={selectedUnitOfficeFilter}
                  onChange={(e) =>
                    onUnitOfficeFilterChange(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none font-medium text-slate-700 h-9 max-w-[170px] truncate disabled:opacity-50"
                >
                  <option value="">-- ຫ້ອງການທັງໝົດ --</option>
                  {unitOfficeFilterOptions.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`ຄົ້ນຫາຊື່ ຫຼື ລະຫັດ${activeMeta.titleLao}...`}
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-slate-100/80 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider border-b border-slate-200"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="py-2.5 px-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-600" />
                  <span>ກຳລັງໂຫຼດຂໍ້ມູນ {activeMeta.titleLao}...</span>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-400">
                  <Building2 className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <span>ບໍ່ພົບຂໍ້ມູນ {activeMeta.titleLao}</span>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-sky-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2.5 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Bar */}
      {!loading && table.getFilteredRowModel().rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
          {/* Rows per page selector & Total count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>ສະແດງ:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="py-1 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none font-bold"
              >
                {[8, 15, 25, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} ແຖວ
                  </option>
                ))}
              </select>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              ທັງໝົດ <span className="font-bold text-slate-800">{table.getFilteredRowModel().rows.length}</span> ລາຍການ
            </div>
          </div>

          {/* Page Buttons & Navigation */}
          <div className="flex items-center gap-1.5">
            <span className="mr-2">
              ໜ້າທີ <span className="font-bold text-slate-800">{table.getState().pagination.pageIndex + 1}</span> ຈາກ{" "}
              <span className="font-bold text-slate-800">{table.getPageCount() || 1}</span>
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0 text-xs rounded-lg"
              title="ໜ້າກ່ອນໜ້າ"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page Numbers (Max 5 buttons) */}
            {(() => {
              const current = table.getState().pagination.pageIndex;
              const total = table.getPageCount();
              const maxVisible = 5;

              let start = Math.max(0, current - Math.floor(maxVisible / 2));
              let end = start + maxVisible;

              if (end > total) {
                end = total;
                start = Math.max(0, end - maxVisible);
              }

              const visiblePages = Array.from(
                { length: end - start },
                (_, i) => start + i
              );

              return visiblePages.map((pageIdx) => {
                const isCurrent = pageIdx === current;
                return (
                  <button
                    key={pageIdx}
                    onClick={() => table.setPageIndex(pageIdx)}
                    className={`h-8 w-8 text-xs font-bold rounded-lg transition-colors ${
                      isCurrent
                        ? "bg-sky-600 text-white shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {pageIdx + 1}
                  </button>
                );
              });
            })()}

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0 text-xs rounded-lg"
              title="ໜ້າຖັດໄປ"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
