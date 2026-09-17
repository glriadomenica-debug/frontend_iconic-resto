import { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

interface TransactionDetail {
  product?: {
    product_name?: string;
  };
  qty?: number;
}

interface Transaction {
  id: number;
  total_price: number;
  payment_status: string;
  created_at: string;
  transaction_details?: TransactionDetail[];
}

interface ProductChart {
  name: string;
  total: number;
}

interface RevenueChart {
  date: string;
  revenue: number;
}

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [topProducts, setTopProducts] = useState<ProductChart[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueChart[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const token = localStorage.getItem("token");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const res = await axios({
        method: "GET",
        url: "http://localhost:8000/api/transactions/analytics",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedTransactions: Transaction[] = res.data.data || [];

      setTransactions(fetchedTransactions);

      const total = fetchedTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.total_price || 0),
        0,
      );

      setTotalRevenue(total);
      setTotalTransactions(fetchedTransactions.length);

      const productMap: Record<string, number> = {};

      fetchedTransactions.forEach((transaction) => {
        transaction.transaction_details?.forEach((detail) => {
          const productName = detail.product?.product_name;

          if (!productName) return;

          const qty = Number(detail.qty || 0);

          if (productMap[productName]) {
            productMap[productName] += qty;
          } else {
            productMap[productName] = qty;
          }
        });
      });

      const formattedProducts = Object.keys(productMap)
        .map((name) => ({
          name,
          total: productMap[name],
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setTopProducts(formattedProducts);

      const revenueMap: Record<string, number> = {};

      fetchedTransactions.forEach((transaction) => {
        const date = new Date(transaction.created_at).toLocaleDateString(
          "id-ID",
        );

        const amount = Number(transaction.total_price || 0);

        if (revenueMap[date]) {
          revenueMap[date] += amount;
        } else {
          revenueMap[date] = amount;
        }
      });

      const formattedRevenue = Object.keys(revenueMap).map((date) => ({
        date,
        revenue: revenueMap[date],
      }));

      setRevenueData(formattedRevenue);
    } catch (error) {
      console.log("ERROR FETCH ANALYTICS :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatDollar = (value: number) => {
    return `$${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500"></div>

          <p className="text-lg font-semibold text-gray-700">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Dashboard Analytics
          </h1>

          <p className="mt-1 text-gray-500">Restaurant sales analytics</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-sm text-gray-500">Total Revenue</h2>

            <p className="mt-3 text-3xl font-bold text-green-600">
              {formatDollar(totalRevenue)}
            </p>

            <p className="mt-1 text-sm text-gray-400">From paid transactions</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-sm text-gray-500">Total Transactions</h2>

            <p className="mt-3 text-3xl font-bold text-blue-600">
              {totalTransactions}
            </p>

            <p className="mt-1 text-sm text-gray-400">Paid transactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-5 text-xl font-semibold text-gray-800">
              Most Ordered Products
            </h2>

            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={topProducts}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar dataKey="total" fill="#f97316" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[320px] items-center justify-center text-gray-400">
                No product analytics found
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-5 text-xl font-semibold text-gray-800">
              Revenue Analytics
            </h2>

            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={revenueData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip formatter={(value) => formatDollar(Number(value))} />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16a34a"
                    strokeWidth={4}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[320px] items-center justify-center text-gray-400">
                No revenue analytics found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
