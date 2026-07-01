// ============================================
// FILE: admin.customers.tsx - FIXED
// ============================================
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatIDR } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customer · Kivora Point Admin" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("customer_name, customer_phone, price");

      if (error) {
        console.error(error);
        setCustomers([]);
        setLoading(false);
        return;
      }

      const grouped: Record<string, any> = {};

      (data || []).forEach((o) => {
        const key = o.customer_phone || o.customer_name;

        if (!grouped[key]) {
          grouped[key] = {
            id: key,
            name: o.customer_name || "-",
            email: o.customer_phone || "-",
            orders: 0,
            spent: 0,
          };
        }

        grouped[key].orders += 1;
        grouped[key].spent += Number(o.price || 0);
      });

      setCustomers(Object.values(grouped));
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading customers...</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {customers.map((c) => (
        <article key={c.id} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-bg text-base font-bold text-white shadow-neon">
              {(c.name || "-")
                .split(" ")
                .map((w: string) => w[0])
                .slice(0, 2)
                .join("")}
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-semibold">{c.name}</h3>
              <p className="truncate text-xs text-muted-foreground">{c.email}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Orders
              </p>
              <p className="mt-1 text-lg font-bold">{c.orders}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Total Spent
              </p>
              <p className="mt-1 text-lg font-bold gradient-text">
                {formatIDR(c.spent)}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}