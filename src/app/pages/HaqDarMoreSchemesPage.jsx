import { ExternalLink, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

const moreSchemes = [
  {
    name: "PM Awas Yojana - Gramin",
    category: "Housing",
    benefit: "Subsidy support for pucca house construction",
    eligibility: "Rural households in SECC list",
    states: ["All India"],
    officialUrl: "https://pmayg.nic.in/"
  },
  {
    name: "National Social Assistance Programme",
    category: "Social Security",
    benefit: "Pension support for widow, disability and old-age beneficiaries",
    eligibility: "BPL households with eligible family members",
    states: ["All India"],
    officialUrl: "https://nsap.nic.in/"
  },
  {
    name: "Pradhan Mantri Fasal Bima Yojana",
    category: "Agriculture",
    benefit: "Crop insurance against natural risks",
    eligibility: "Loanee and non-loanee farmers",
    states: ["All India"],
    officialUrl: "https://pmfby.gov.in/"
  },
  {
    name: "PM Suraksha Bima Yojana",
    category: "Insurance",
    benefit: "Accident insurance cover at low annual premium",
    eligibility: "Bank account holders aged 18-70",
    states: ["All India"],
    officialUrl: "https://jansuraksha.gov.in/"
  },
  {
    name: "Mudra Loan (Shishu/Kishore/Tarun)",
    category: "Livelihood",
    benefit: "Collateral-free small business loans",
    eligibility: "Micro and small entrepreneurs",
    states: ["All India"],
    officialUrl: "https://www.mudra.org.in/"
  },
  {
    name: "Ayushman Bharat - PMJAY",
    category: "Health",
    benefit: "Cashless secondary and tertiary care coverage",
    eligibility: "Eligible low-income families",
    states: ["All India", "Uttar Pradesh", "Maharashtra", "Bihar", "Rajasthan"],
    officialUrl: "https://pmjay.gov.in/"
  },
  {
    name: "Mukhyamantri Kisan Kalyan Yojana",
    category: "Agriculture",
    benefit: "Top-up support over PM-Kisan installments",
    eligibility: "Registered farmers in Madhya Pradesh",
    states: ["Madhya Pradesh"],
    officialUrl: "https://saara.mp.gov.in/"
  },
  {
    name: "KALIA Scheme",
    category: "Agriculture",
    benefit: "Financial support for cultivators and landless laborers",
    eligibility: "Eligible farming households in Odisha",
    states: ["Odisha"],
    officialUrl: "https://kalia.odisha.gov.in/"
  }
];

export default function HaqDarMoreSchemesPage() {
  const [selectedState, setSelectedState] = useState("All States");

  const stateOptions = useMemo(() => {
    const allStates = moreSchemes.flatMap((scheme) => scheme.states || []);
    const uniqueStates = Array.from(new Set(allStates.filter((state) => state !== "All India"))).sort();
    return ["All States", ...uniqueStates];
  }, []);

  const filteredSchemes = useMemo(() => {
    if (selectedState === "All States") {
      return moreSchemes;
    }

    return moreSchemes.filter((scheme) => {
      const states = scheme.states || [];
      return states.includes("All India") || states.includes(selectedState);
    });
  }, [selectedState]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAF9] to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl text-gray-900 mb-3">Find More Schemes</h1>
          <p className="text-lg md:text-xl text-gray-600">Discover additional official schemes your family may qualify for.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 mb-8 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 text-gray-700">
            <Search className="w-5 h-5" />
            <p>Use official portals only. Eligibility can vary by state and district.</p>
          </div>
          <div className="md:ml-auto flex items-center gap-3">
            <label htmlFor="stateFilter" className="text-sm text-gray-600">State</label>
            <select
              id="stateFilter"
              value={selectedState}
              onChange={(event) => setSelectedState(event.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1B7F3A]"
            >
              {stateOptions.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div className="md:ml-auto flex items-center gap-2 text-[#1B7F3A]">
            <ShieldCheck className="w-5 h-5" />
            <span>Verified public sources</span>
          </div>
        </div>

        <div className="mb-6 text-gray-700">
          Showing {filteredSchemes.length} scheme{filteredSchemes.length === 1 ? "" : "s"}
          {selectedState !== "All States" ? ` for ${selectedState}` : " across all states"}.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme) => (
            <div key={scheme.name} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-xl text-gray-900">{scheme.name}</h2>
                <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#1B7F3A] text-sm whitespace-nowrap">
                  {scheme.category}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{scheme.benefit}</p>
              <p className="text-gray-600 mb-5">Eligibility: {scheme.eligibility}</p>
              <p className="text-gray-500 mb-5">Available in: {scheme.states.join(", ")}</p>

              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1B7F3A] text-white px-5 py-2.5 rounded-lg hover:bg-[#155d2b] transition-all"
              >
                Visit Official Site
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6 border border-dashed border-gray-300 text-gray-700">
            No schemes found for the selected state. Try another state or choose All States.
          </div>
        )}
      </div>
    </div>
  );
}
