const OPTIONS = [
  {
    title: "Post Office Recurring Deposit",
    description: "Sarkari backed option, regular monthly savings ke liye safe.",
    minimumDeposit: "₹100/month",
    interestRate: "6.7% p.a.",
  },
  {
    title: "Bank Recurring Deposit",
    description: "Bank account se auto debit possible. Discipline maintain hota hai.",
    minimumDeposit: "₹500/month",
    interestRate: "6.0% - 7.5% p.a.",
  },
  {
    title: "Self Help Group Savings",
    description: "Community based saving, small amount se start ho sakta hai.",
    minimumDeposit: "₹50/week",
    interestRate: "Varies (approx 8% - 12%)",
  },
  {
    title: "Jan Dhan Standing Instruction",
    description: "Jan Dhan account se fixed weekly/monthly transfer set karo.",
    minimumDeposit: "₹50/week",
    interestRate: "As per linked savings account",
  },
];

export default function SafeSavingsOptions() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-xl text-gray-900">Safe Savings Options</h3>
      <p className="mt-1 text-sm text-gray-600">Compare safe places to park small monthly savings.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {OPTIONS.map((item) => (
          <div key={item.title} className="rounded-2xl border border-gray-100 bg-gradient-to-br from-[#F8FAF9] to-white p-4">
            <h4 className="text-base font-medium text-gray-900">{item.title}</h4>
            <p className="mt-1 text-sm text-gray-600">{item.description}</p>
            <p className="mt-2 text-sm text-gray-700">Minimum: <span className="font-medium">{item.minimumDeposit}</span></p>
            <p className="text-sm text-gray-700">Interest: <span className="font-medium">{item.interestRate}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}
