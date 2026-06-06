export const saveStatus = (id: string, s: string, n?: string) => {
  fetch("/api/orders/"+id+"/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: s, note: n }),
  }).catch(() => {});
};
