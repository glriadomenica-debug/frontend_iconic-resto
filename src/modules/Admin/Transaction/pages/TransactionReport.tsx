import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";

interface Product {
  id: number;
  product_name: string;
  price: number;
}

interface TransactionDetail {
  id: number;
  transaction_id: number;
  product_id: number;
  qty: number;
  price: number;
  subtotal: number;
  product?: Product;
}

interface Transaction {
  id: number;
  queue_number: number;
  customer_name: string;
  table_number: number;
  total_price: number;
  payment_method: string;
  payment_status: string;
  kitchen_status: string;
  status?: string;
  created_at: string;
  transaction_details?: TransactionDetail[];
}

type FilterType = "monthly" | "weekly" | "all";

interface ProductSale {
  product_name: string;
  qty: number;
  revenue: number;
}

export default function TransactionReport() {
  const token = localStorage.getItem("token");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [exportOpen, setExportOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return `$${Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPaymentMethod = (value: string) => {
    if (!value) return "-";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatStatus = (value: string) => {
    if (!value) return "-";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getDateOnly = (dateString: string) => {
    if (!dateString) return "";

    return dateString.substring(0, 10);
  };

  const getTransactionYear = (dateString: string) => {
    const dateOnly = getDateOnly(dateString);

    if (!dateOnly) return 0;

    return Number(dateOnly.substring(0, 4));
  };

  const getTransactionMonth = (dateString: string) => {
    const dateOnly = getDateOnly(dateString);

    if (!dateOnly) return 0;

    return Number(dateOnly.substring(5, 7));
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString("en-US", {
      month: "long",
    });
  };

  const getSafeFilename = () => {
    return reportPeriod
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "")
      .toLowerCase();
  };

  const fetchReport = async () => {
    try {
      setLoading(true);

      const res = await axios({
        method: "GET",
        url: "http://localhost:8000/api/transactions/report",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = res.data?.data;

      let reportData: Transaction[] = [];

      if (Array.isArray(responseData)) {
        reportData = responseData;
      } else if (Array.isArray(responseData?.data)) {
        reportData = responseData.data;
      }

      setTransactions(reportData);

      console.log("Transaction report:", reportData);
    } catch (error) {
      console.error("Failed to fetch transaction report:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (filterType === "monthly") {
      result = result.filter((item) => {
        const month = getTransactionMonth(item.created_at);
        const year = getTransactionYear(item.created_at);

        return month === Number(selectedMonth) && year === Number(selectedYear);
      });
    }

    if (filterType === "weekly") {
      const now = new Date();

      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();

      startOfWeek.setDate(startOfWeek.getDate() - day);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      result = result.filter((item) => {
        const date = new Date(item.created_at);

        return date >= startOfWeek && date <= endOfWeek;
      });
    }

    return result;
  }, [transactions, filterType, selectedMonth, selectedYear]);

  const paidTransactions = useMemo(() => {
    return filteredTransactions.filter(
      (item) => item.payment_status === "paid",
    );
  }, [filteredTransactions]);

  const totalTransactions = filteredTransactions.length;
  const totalPaidTransactions = paidTransactions.length;
  const totalRevenue = paidTransactions.reduce(
    (total, transaction) => total + Number(transaction.total_price || 0),
    0,
  );

  const paymentMethodData = useMemo(() => {
    const result: Record<string, number> = {};

    paidTransactions.forEach((transaction) => {
      const method = transaction.payment_method || "unknown";

      result[method] = (result[method] || 0) + 1;
    });

    return Object.entries(result)
      .map(([method, count]) => ({
        method,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [paidTransactions]);

  const productSales = useMemo(() => {
    const sales: Record<string, ProductSale> = {};

    paidTransactions.forEach((transaction) => {
      transaction.transaction_details?.forEach((detail) => {
        const productName =
          detail.product?.product_name || `Product #${detail.product_id}`;

        const qty = Number(detail.qty || 0);
        const revenue = Number(detail.subtotal || 0);

        if (!sales[productName]) {
          sales[productName] = {
            product_name: productName,
            qty: 0,
            revenue: 0,
          };
        }

        sales[productName].qty += qty;
        sales[productName].revenue += revenue;
      });
    });

    return Object.values(sales).sort((a, b) => {
      if (b.qty !== a.qty) {
        return b.qty - a.qty;
      }

      return b.revenue - a.revenue;
    });
  }, [paidTransactions]);

  const bestSeller = productSales.length > 0 ? productSales[0] : null;

  const reportPeriod = useMemo(() => {
    if (filterType === "monthly") {
      return `${getMonthName(Number(selectedMonth))} ${selectedYear}`;
    }

    if (filterType === "weekly") {
      return "Current Week";
    }

    return "All Transactions";
  }, [filterType, selectedMonth, selectedYear]);

  const exportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("No transaction data available for export.");
      return;
    }

    const headers = [
      "Queue Number",
      "Customer Name",
      "Table Number",
      "Total Price",
      "Payment Method",
      "Payment Status",
      "Kitchen Status",
      "Created At",
    ];

    const rows = filteredTransactions.map((transaction) => [
      transaction.queue_number ?? "",
      transaction.customer_name ?? "",
      transaction.table_number ?? "",
      Number(transaction.total_price || 0).toFixed(2),
      formatPaymentMethod(transaction.payment_method),
      formatStatus(transaction.payment_status),
      formatStatus(transaction.kitchen_status),
      formatDateTime(transaction.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => {
            const stringValue = String(value ?? "");

            if (
              stringValue.includes(",") ||
              stringValue.includes('"') ||
              stringValue.includes("\n")
            ) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }

            return stringValue;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `transaction-report-${getSafeFilename()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setExportOpen(false);
  };

  const applyExcelStyle = (
    worksheet: XLSX.WorkSheet,
    range: string,
    style: any,
  ) => {
    const decoded = XLSX.utils.decode_range(range);

    for (let row = decoded.s.r; row <= decoded.e.r; row++) {
      for (let col = decoded.s.c; col <= decoded.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: row,
          c: col,
        });

        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = {
            v: "",
            t: "s",
          };
        }

        worksheet[cellAddress].s = style;
      }
    }
  };

  const setExcelColumnWidths = (
    worksheet: XLSX.WorkSheet,
    widths: number[],
  ) => {
    worksheet["!cols"] = widths.map((wch) => ({
      wch,
    }));
  };

  const addExcelBorders = (style: any) => {
    return {
      ...style,
      border: {
        top: {
          style: "thin",
          color: {
            rgb: "D1D5DB",
          },
        },
        bottom: {
          style: "thin",
          color: {
            rgb: "D1D5DB",
          },
        },
        left: {
          style: "thin",
          color: {
            rgb: "D1D5DB",
          },
        },
        right: {
          style: "thin",
          color: {
            rgb: "D1D5DB",
          },
        },
      },
    };
  };

  const exportExcel = () => {
    if (filteredTransactions.length === 0) {
      alert("No transaction data available for export.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    const titleStyle = {
      font: {
        bold: true,
        sz: 18,
        color: {
          rgb: "FFFFFF",
        },
      },
      fill: {
        fgColor: {
          rgb: "F97316",
        },
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };

    const subtitleStyle = {
      font: {
        bold: true,
        sz: 11,
        color: {
          rgb: "374151",
        },
      },
      fill: {
        fgColor: {
          rgb: "FFF7ED",
        },
      },
      alignment: {
        vertical: "center",
      },
    };

    const sectionStyle = {
      font: {
        bold: true,
        sz: 12,
        color: {
          rgb: "FFFFFF",
        },
      },
      fill: {
        fgColor: {
          rgb: "374151",
        },
      },
      alignment: {
        horizontal: "left",
        vertical: "center",
      },
    };

    const headerStyle = addExcelBorders({
      font: {
        bold: true,
        sz: 10,
        color: {
          rgb: "FFFFFF",
        },
      },
      fill: {
        fgColor: {
          rgb: "EA580C",
        },
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      },
    });

    const bodyStyle = addExcelBorders({
      font: {
        sz: 10,
        color: {
          rgb: "374151",
        },
      },
      alignment: {
        vertical: "center",
      },
    });

    const alternateBodyStyle = addExcelBorders({
      font: {
        sz: 10,
        color: {
          rgb: "374151",
        },
      },
      fill: {
        fgColor: {
          rgb: "FFF7ED",
        },
      },
      alignment: {
        vertical: "center",
      },
    });

    const labelStyle = addExcelBorders({
      font: {
        bold: true,
        sz: 10,
        color: {
          rgb: "374151",
        },
      },
      fill: {
        fgColor: {
          rgb: "F3F4F6",
        },
      },
      alignment: {
        vertical: "center",
      },
    });

    const currencyStyle = addExcelBorders({
      font: {
        sz: 10,
        color: {
          rgb: "374151",
        },
      },
      numFmt: "$#,##0.00",
      alignment: {
        horizontal: "right",
        vertical: "center",
      },
    });

    const summaryData: any[][] = [
      ["TRANSACTION REPORT"],
      [],
      ["Report Period", reportPeriod],
      ["Generated At", formatDateTime(new Date().toISOString())],
      [],
      ["SUMMARY"],
      ["Total Transactions", totalTransactions],
      ["Paid Transactions", totalPaidTransactions],
      ["Total Revenue", totalRevenue],
      [],
      ["PAYMENT METHOD"],
      ["Payment Method", "Transactions"],
      ...paymentMethodData.map((item) => [
        formatPaymentMethod(item.method),
        item.count,
      ]),
      [],
      ["BEST SELLER"],
      ["Product", "Quantity Sold", "Revenue"],
      ...(bestSeller
        ? [[bestSeller.product_name, bestSeller.qty, bestSeller.revenue]]
        : [["No product sales", 0, 0]]),
    ];

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);

    summaryWorksheet["!merges"] = [
      {
        s: {
          r: 0,
          c: 0,
        },
        e: {
          r: 0,
          c: 2,
        },
      },
    ];

    setExcelColumnWidths(summaryWorksheet, [30, 24, 20]);
    summaryWorksheet["A1"].s = titleStyle;
    applyExcelStyle(summaryWorksheet, "A3:B4", bodyStyle);

    summaryWorksheet["A3"].s = labelStyle;
    summaryWorksheet["A4"].s = labelStyle;
    applyExcelStyle(summaryWorksheet, "A6:C6", sectionStyle);

    applyExcelStyle(summaryWorksheet, "A7:B9", bodyStyle);
    summaryWorksheet["A7"].s = labelStyle;
    summaryWorksheet["A8"].s = labelStyle;
    summaryWorksheet["A9"].s = labelStyle;
    summaryWorksheet["B9"].s = currencyStyle;
    applyExcelStyle(summaryWorksheet, "A11:B11", sectionStyle);

    const paymentHeaderRow = 12;

    applyExcelStyle(
      summaryWorksheet,
      `A${paymentHeaderRow}:B${paymentHeaderRow}`,
      headerStyle,
    );

    const paymentStartRow = paymentHeaderRow + 1;
    const paymentEndRow = paymentStartRow + paymentMethodData.length - 1;

    if (paymentMethodData.length > 0) {
      applyExcelStyle(
        summaryWorksheet,
        `A${paymentStartRow}:B${paymentEndRow}`,
        bodyStyle,
      );
    }

    const bestSellerSectionRow =
      paymentMethodData.length > 0 ? paymentEndRow + 2 : paymentHeaderRow + 2;

    const bestSellerHeaderRow = bestSellerSectionRow + 1;

    summaryWorksheet[`A${bestSellerSectionRow}`].s = sectionStyle;

    applyExcelStyle(
      summaryWorksheet,
      `A${bestSellerSectionRow}:C${bestSellerSectionRow}`,
      sectionStyle,
    );

    applyExcelStyle(
      summaryWorksheet,
      `A${bestSellerHeaderRow}:C${bestSellerHeaderRow}`,
      headerStyle,
    );

    const bestSellerDataRow = bestSellerHeaderRow + 1;

    applyExcelStyle(
      summaryWorksheet,
      `A${bestSellerDataRow}:C${bestSellerDataRow}`,
      bodyStyle,
    );
    summaryWorksheet[`C${bestSellerDataRow}`].s = currencyStyle;

    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

    const transactionData: any[][] = [
      ["TRANSACTION DETAILS"],
      [],
      ["Report Period", reportPeriod],
      ["Total Transactions", filteredTransactions.length],
      [],
      [
        "Date",
        "Queue",
        "Customer",
        "Table",
        "Total",
        "Payment",
        "Payment Status",
        "Kitchen Status",
      ],
      ...filteredTransactions.map((transaction) => [
        formatDateTime(transaction.created_at),
        `#${String(transaction.queue_number ?? "-").padStart(2, "0")}`,
        transaction.customer_name ?? "-",
        transaction.table_number ?? "-",
        Number(transaction.total_price || 0),
        formatPaymentMethod(transaction.payment_method),
        formatStatus(transaction.payment_status),
        formatStatus(transaction.kitchen_status),
      ]),
    ];

    const transactionWorksheet = XLSX.utils.aoa_to_sheet(transactionData);
    transactionWorksheet["!merges"] = [
      {
        s: {
          r: 0,
          c: 0,
        },
        e: {
          r: 0,
          c: 7,
        },
      },
    ];

    setExcelColumnWidths(
      transactionWorksheet,
      [25, 12, 28, 12, 18, 20, 20, 20],
    );
    transactionWorksheet["A1"].s = titleStyle;
    applyExcelStyle(transactionWorksheet, "A3:B4", bodyStyle);
    transactionWorksheet["A3"].s = labelStyle;
    transactionWorksheet["A4"].s = labelStyle;

    const transactionHeaderRow = 6;
    const transactionDataStartRow = 7;
    const transactionDataEndRow =
      transactionDataStartRow + filteredTransactions.length - 1;

    applyExcelStyle(
      transactionWorksheet,
      `A${transactionHeaderRow}:H${transactionHeaderRow}`,
      headerStyle,
    );

    if (filteredTransactions.length > 0) {
      for (
        let row = transactionDataStartRow;
        row <= transactionDataEndRow;
        row++
      ) {
        const rowStyle = row % 2 === 0 ? alternateBodyStyle : bodyStyle;

        applyExcelStyle(transactionWorksheet, `A${row}:H${row}`, rowStyle);

        transactionWorksheet[`E${row}`].s = currencyStyle;

        transactionWorksheet[`B${row}`].s = addExcelBorders({
          ...rowStyle,
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        });

        transactionWorksheet[`D${row}`].s = addExcelBorders({
          ...rowStyle,
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        });

        transactionWorksheet[`G${row}`].s = addExcelBorders({
          ...rowStyle,
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        });

        transactionWorksheet[`H${row}`].s = addExcelBorders({
          ...rowStyle,
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        });
      }

      transactionWorksheet["!autofilter"] = {
        ref: `A${transactionHeaderRow}:H${transactionDataEndRow}`,
      };
    } else {
      transactionWorksheet["!autofilter"] = {
        ref: `A${transactionHeaderRow}:H${transactionHeaderRow}`,
      };
    }

    XLSX.utils.book_append_sheet(
      workbook,
      transactionWorksheet,
      "Transactions",
    );

    const productData: any[][] = [
      ["PRODUCT SALES"],
      [],
      ["Report Period", reportPeriod],
      ["Paid Transactions", totalPaidTransactions],
      [],
      ["Product", "Quantity Sold", "Revenue"],
      ...productSales.map((product) => [
        product.product_name,
        product.qty,
        product.revenue,
      ]),
    ];

    const productWorksheet = XLSX.utils.aoa_to_sheet(productData);

    productWorksheet["!merges"] = [
      {
        s: {
          r: 0,
          c: 0,
        },
        e: {
          r: 0,
          c: 2,
        },
      },
    ];
    setExcelColumnWidths(productWorksheet, [38, 20, 22]);
    productWorksheet["A1"].s = titleStyle;
    applyExcelStyle(productWorksheet, "A3:B4", bodyStyle);
    productWorksheet["A3"].s = labelStyle;
    productWorksheet["A4"].s = labelStyle;

    const productHeaderRow = 6;
    const productDataStartRow = 7;
    const productDataEndRow = productDataStartRow + productSales.length - 1;

    applyExcelStyle(
      productWorksheet,
      `A${productHeaderRow}:C${productHeaderRow}`,
      headerStyle,
    );

    if (productSales.length > 0) {
      for (let row = productDataStartRow; row <= productDataEndRow; row++) {
        const rowStyle = row % 2 === 0 ? alternateBodyStyle : bodyStyle;
        applyExcelStyle(productWorksheet, `A${row}:C${row}`, rowStyle);
        productWorksheet[`B${row}`].s = addExcelBorders({
          ...rowStyle,
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        });
        productWorksheet[`C${row}`].s = currencyStyle;
      }

      productWorksheet["!autofilter"] = {
        ref: `A${productHeaderRow}:C${productDataEndRow}`,
      };
    }

    XLSX.utils.book_append_sheet(workbook, productWorksheet, "Product Sales");

    workbook.Props = {
      Title: `Transaction Report - ${reportPeriod}`,
      Subject: "Restaurant Transaction Report",
      Author: "Restaurant Management System",
      Company: "Restaurant Management System",
      Category: "Transaction Report",
      Keywords: "transaction, payment, revenue, restaurant, sales",
      Comments: "Generated by Restaurant Management System",
    };
    const filename = `transaction-report-${getSafeFilename()}.xlsx`;
    XLSX.writeFile(workbook, filename);
    setExportOpen(false);
  };

  const addPDFHeader = (
    doc: jsPDF,
    pageNumber: number,
    totalPages?: number,
  ) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, pageWidth, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text("RESTAURANT MANAGEMENT SYSTEM", 14, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Transaction Report - ${reportPeriod}`, 14, 21);
    doc.text(
      `Page ${pageNumber}${totalPages ? ` of ${totalPages}` : ""}`,
      pageWidth - 14,
      16,
      {
        align: "right",
      },
    );

    doc.setDrawColor(229, 231, 235);
    doc.line(14, 25, pageWidth - 14, 25);
  };

  const addPDFFooter = (doc: jsPDF, pageNumber: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(229, 231, 235);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text("Generated by Restaurant Management System", 14, pageHeight - 9);
    doc.text(`Page ${pageNumber}`, pageWidth - 14, pageHeight - 9, {
      align: "right",
    });
  };

  const exportPDF = () => {
    if (filteredTransactions.length === 0) {
      alert("No transaction data available for export.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, pageWidth, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);
    doc.setTextColor(31, 41, 55);
    doc.text("TRANSACTION REPORT", pageWidth / 2, 23, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);

    doc.text("Restaurant Management System", pageWidth / 2, 30, {
      align: "center",
    });

    doc.setDrawColor(229, 231, 235);
    doc.line(14, 36, pageWidth - 14, 36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text("REPORT PERIOD", 14, 44);
    doc.text("GENERATED", pageWidth - 14, 44, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(reportPeriod, 14, 50);
    doc.text(formatDateTime(new Date().toISOString()), pageWidth - 14, 50, {
      align: "right",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(31, 41, 55);
    doc.text("Summary", 14, 63);
    autoTable(doc, {
      startY: 68,
      head: [["Total Transactions", "Paid Transactions", "Total Revenue"]],
      body: [
        [
          totalTransactions.toString(),
          totalPaidTransactions.toString(),
          formatCurrency(totalRevenue),
        ],
      ],
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 6,
        halign: "center",
        valign: "middle",
        lineColor: [229, 231, 235],
        lineWidth: 0.2,
        textColor: [55, 65, 81],
      },
      headStyles: {
        fillColor: [55, 65, 81],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fillColor: [255, 247, 237],
        fontStyle: "bold",
      },
      margin: {
        left: 14,
        right: 14,
      },
    });

    const summaryFinalY = (doc as any).lastAutoTable?.finalY || 90;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(31, 41, 55);
    doc.text("Payment Method", 14, summaryFinalY + 14);

    const paymentRows =
      paymentMethodData.length > 0
        ? paymentMethodData.map((item) => [
            formatPaymentMethod(item.method),
            item.count.toString(),
            `${(
              (item.count / Math.max(totalPaidTransactions, 1)) *
              100
            ).toFixed(1)}%`,
          ])
        : [["No paid transactions", "-", "-"]];

    autoTable(doc, {
      startY: summaryFinalY + 19,
      head: [["Payment Method", "Transactions", "Percentage"]],
      body: paymentRows,
      theme: "striped",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 4,
        valign: "middle",
        lineColor: [229, 231, 235],
        lineWidth: 0.2,
        textColor: [55, 65, 81],
      },
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        1: {
          halign: "center",
          cellWidth: 40,
        },
        2: {
          halign: "center",
          cellWidth: 35,
        },
      },
      margin: {
        left: 14,
        right: 14,
      },
    });

    const paymentFinalY = (doc as any).lastAutoTable?.finalY || 120;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Best Seller", 14, paymentFinalY + 14);

    if (bestSeller) {
      autoTable(doc, {
        startY: paymentFinalY + 19,
        head: [["Product", "Quantity Sold", "Revenue"]],
        body: [
          [
            bestSeller.product_name,
            bestSeller.qty.toString(),
            formatCurrency(bestSeller.revenue),
          ],
        ],
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 4,
          valign: "middle",
          lineColor: [229, 231, 235],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [55, 65, 81],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: {
          fillColor: [255, 247, 237],
          fontStyle: "bold",
        },
        columnStyles: {
          1: {
            halign: "center",
            cellWidth: 40,
          },
          2: {
            halign: "right",
            cellWidth: 45,
          },
        },
        margin: {
          left: 14,
          right: 14,
        },
      });
    } else {
      autoTable(doc, {
        startY: paymentFinalY + 19,
        head: [["Product", "Quantity Sold", "Revenue"]],
        body: [["No product sales", "-", "-"]],
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [55, 65, 81],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        margin: {
          left: 14,
          right: 14,
        },
      });
    }

    const bestSellerFinalY = (doc as any).lastAutoTable?.finalY || 150;
    let productStartY = bestSellerFinalY + 16;
    if (productStartY > pageHeight - 70) {
      doc.addPage();
      productStartY = 35;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Product Sales", 14, productStartY);

    const productRows =
      productSales.length > 0
        ? productSales.map((product) => [
            product.product_name,
            product.qty.toString(),
            formatCurrency(product.revenue),
          ])
        : [["No product sales", "-", "-"]];

    autoTable(doc, {
      startY: productStartY + 6,
      head: [["Product", "Quantity Sold", "Revenue"]],
      body: productRows,
      theme: "striped",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 3.5,
        valign: "middle",
        lineColor: [229, 231, 235],
        lineWidth: 0.2,
        textColor: [55, 65, 81],
      },

      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },

      alternateRowStyles: {
        fillColor: [255, 247, 237],
      },

      columnStyles: {
        0: {
          cellWidth: 90,
        },

        1: {
          cellWidth: 35,
          halign: "center",
        },

        2: {
          cellWidth: 45,
          halign: "right",
        },
      },

      margin: {
        left: 14,
        right: 14,
      },
    });

    const productFinalY = (doc as any).lastAutoTable?.finalY || 190;
    let transactionStartY = productFinalY + 17;
    if (transactionStartY > pageHeight - 65) {
      doc.addPage();
      transactionStartY = 35;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(31, 41, 55);
    doc.text("Transaction Details", 14, transactionStartY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(
      "Payment status and kitchen status are managed independently.",
      14,
      transactionStartY + 5,
    );

    const transactionRows = filteredTransactions.map((transaction) => [
      formatDateTime(transaction.created_at),
      `#${String(transaction.queue_number ?? "-").padStart(2, "0")}`,
      transaction.customer_name || "-",
      String(transaction.table_number ?? "-"),
      formatCurrency(Number(transaction.total_price || 0)),
      formatPaymentMethod(transaction.payment_method),
      formatStatus(transaction.payment_status),
      formatStatus(transaction.kitchen_status),
    ]);

    autoTable(doc, {
      startY: transactionStartY + 10,
      head: [
        [
          "Date",
          "Queue",
          "Customer",
          "Table",
          "Total",
          "Payment",
          "Payment Status",
          "Kitchen Status",
        ],
      ],
      body: transactionRows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 6.8,
        cellPadding: 2.5,
        valign: "middle",
        lineColor: [229, 231, 235],
        lineWidth: 0.2,
        textColor: [55, 65, 81],
        overflow: "linebreak",
      },

      headStyles: {
        fillColor: [55, 65, 81],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 6.8,
        halign: "center",
        valign: "middle",
      },

      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },

      columnStyles: {
        0: {
          cellWidth: 25,
        },

        1: {
          cellWidth: 13,
          halign: "center",
        },

        2: {
          cellWidth: 27,
        },

        3: {
          cellWidth: 11,
          halign: "center",
        },

        4: {
          cellWidth: 22,
          halign: "right",
        },

        5: {
          cellWidth: 23,
        },

        6: {
          cellWidth: 25,
          halign: "center",
        },

        7: {
          cellWidth: 25,
          halign: "center",
        },
      },

      margin: {
        left: 14,
        right: 14,
        top: 30,
        bottom: 22,
      },

      didDrawPage: (data) => {
        const pageNumber = data.pageNumber;
        if (pageNumber > 1) {
          addPDFHeader(doc, pageNumber);
        }
        addPDFFooter(doc, pageNumber);
      },
    });

    const totalPages = (doc as any).internal.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);
      if (page > 1) {
        addPDFHeader(doc, page, totalPages);
      }
      addPDFFooter(doc, page);
    }

    const filename = `transaction-report-${getSafeFilename()}.pdf`;

    doc.save(filename);

    setExportOpen(false);
  };

  const handleExport = (type: "pdf" | "excel" | "csv") => {
    if (type === "pdf") {
      exportPDF();
      return;
    }

    if (type === "excel") {
      exportExcel();
      return;
    }

    if (type === "csv") {
      exportCSV();
      return;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Transaction Report
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            View transaction, payment, revenue, and product sales reports.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setExportOpen((prev) => !prev)}
            disabled={loading || filteredTransactions.length === 0}
            className={`px-5 py-2.5 rounded-xl font-semibold text-white transition flex items-center gap-2 ${
              loading || filteredTransactions.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
            }`}
          >
            Export Report
            <span className="text-sm">▼</span>
          </button>

          {exportOpen && filteredTransactions.length > 0 && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-30">
              <button
                type="button"
                onClick={() => handleExport("pdf")}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 transition text-sm font-medium text-gray-700"
              >
                📄 Export PDF
              </button>

              <button
                type="button"
                onClick={() => handleExport("excel")}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 transition text-sm font-medium text-gray-700"
              >
                📊 Export Excel
              </button>

              <button
                type="button"
                onClick={() => handleExport("csv")}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 transition text-sm font-medium text-gray-700"
              >
                📋 Export CSV
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Filter
            </label>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="monthly">Monthly</option>

              <option value="weekly">Weekly</option>

              <option value="all">All Transactions</option>
            </select>
          </div>

          {filterType === "monthly" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Month
                </label>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {Array.from(
                    {
                      length: 12,
                    },
                    (_, index) => index + 1,
                  ).map((month) => (
                    <option key={month} value={month}>
                      {getMonthName(month)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Year
                </label>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {Array.from(
                    {
                      length: 6,
                    },
                    (_, index) => new Date().getFullYear() - index,
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={fetchReport}
            className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-semibold transition cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">{reportPeriod}</h2>

        <p className="text-sm text-gray-500">
          {filteredTransactions.length} transaction
          {filteredTransactions.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
          <p className="text-gray-500">Loading transaction report...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Total Transactions</p>

              <h3 className="text-2xl font-bold text-gray-800 mt-2">
                {totalTransactions}
              </h3>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Paid Transactions</p>

              <h3 className="text-2xl font-bold text-green-600 mt-2">
                {totalPaidTransactions}
              </h3>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Total Revenue</p>

              <h3 className="text-2xl font-bold text-orange-600 mt-2">
                {formatCurrency(totalRevenue)}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Payment Method
              </h2>

              {paymentMethodData.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethodData.map((item) => (
                    <div
                      key={item.method}
                      className="flex items-center justify-between border-b border-gray-100 pb-3"
                    >
                      <span className="text-gray-700">
                        {formatPaymentMethod(item.method)}
                      </span>

                      <span className="font-bold text-gray-800">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  No paid transactions.
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Best Seller
              </h2>

              {bestSeller ? (
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {bestSeller.product_name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    {bestSeller.qty} items sold
                  </p>

                  <p className="text-lg font-bold text-orange-600 mt-2">
                    {formatCurrency(bestSeller.revenue)}
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  No product sales.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Product Sales
            </h2>

            {productSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3">Product</th>
                      <th className="text-center py-3 px-3">Quantity</th>
                      <th className="text-right py-3 px-3">Revenue</th>
                    </tr>
                  </thead>

                  <tbody>
                    {productSales.map((product) => (
                      <tr
                        key={product.product_name}
                        className="border-b border-gray-100"
                      >
                        <td className="py-3 px-3 font-medium text-gray-800">
                          {product.product_name}
                        </td>

                        <td className="py-3 px-3 text-center">{product.qty}</td>

                        <td className="py-3 px-3 text-right font-semibold text-gray-800">
                          {formatCurrency(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400">
                No product sales for this period.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <h2 className="text-lg font-bold text-gray-800">Transactions</h2>

              <p className="text-sm text-gray-500">
                Revenue only includes verified payments.
              </p>
            </div>

            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-md min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3">Date</th>
                      <th className="text-left py-3 px-3">Queue</th>
                      <th className="text-left py-3 px-3">Customer</th>
                      <th className="text-center py-3 px-3">Table</th>
                      <th className="text-right py-3 px-3">Total</th>
                      <th className="text-left py-3 px-3">Payment</th>
                      <th className="text-center py-3 px-3">Payment Status</th>
                      <th className="text-center py-3 px-3">Kitchen Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-3 text-gray-500">
                          {formatDateTime(transaction.created_at)}
                        </td>

                        <td className="py-3 px-3 font-bold text-gray-800">
                          #
                          {String(transaction.queue_number ?? "-").padStart(
                            2,
                            "0",
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-gray-800">
                            {transaction.customer_name || "-"}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {transaction.table_number ?? "-"}
                        </td>

                        <td className="py-3 px-3 text-right font-semibold text-gray-800">
                          {formatCurrency(transaction.total_price)}
                        </td>

                        <td className="py-3 px-3">
                          {formatPaymentMethod(transaction.payment_method)}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              transaction.payment_status === "paid"
                                ? "bg-green-100 text-green-700"
                                : transaction.payment_status === "unpaid"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {formatStatus(transaction.payment_status)}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              transaction.kitchen_status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : transaction.kitchen_status === "cooking"
                                  ? "bg-blue-100 text-blue-700"
                                  : transaction.kitchen_status === "ready"
                                    ? "bg-green-100 text-green-700"
                                    : transaction.kitchen_status === "served"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {formatStatus(transaction.kitchen_status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-400">
                  No transactions found for this period.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
