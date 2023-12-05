"use client";

import { useWeb5 } from "@/plugins/web5.client";
import { readCampaigns } from "@/utils/web5.utils";
import { CampaignCard } from "@/components/CampaignCard";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import { useForm } from "react-hook-form";
import Alert from "@/components/Alert";
import Link from "next/link";

const Campaigns = () => {
  const { web5, myDID } = useWeb5();
  const [campaigns, setCampaigns] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onSubmit" });
  const [submittedDID, setSubmittedDID] = useState("");

  const fetchData = async (did: string) => {
    if (did && web5) {
      try {
        const campaignArray = await readCampaigns(did, web5);
        setCampaigns(campaignArray);
      } catch (error) {
        // Handle errors if any
        console.error(error);
      }
    } else if (web5 && !did) {
      try {
        const {campaignArray, recordID} = await readCampaigns(myDID, web5);
        setCampaigns(campaignArray);
      } catch (error) {
        // Handle errors if any
        console.error(error);
      }
    }
  };

  const onSubmit = (data: any) => {
    setSubmittedDID(data.did);
    fetchData(data);
  };

  useEffect(()=>{console.log(campaigns)},[campaigns])

  return (
    <>
      <header className="px-10 py-5 bg-[#FBF8F6]">
        <div className="flex justify-between flex-col gap-10">
          <section className="flex justify-between">
            <article className="w-full flex items-baseline text-4xl font-bold text-left">
              <h1>Explore Campaigns</h1>
            </article>
            <Link
              href={"/campaigns/create"}
              className="btn bg-green-50 hover:bg-black-100 whitespace-nowrap"
            >
              Create a campaign
            </Link>
          </section>

          <form className="form" id="search" onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              placeholder="Place a DID or leave it empty to search for your campaigns"
              {...register("search", {
                pattern: {
                  value: /^(?!\d+$).*/,
                  message: "A name cant be only a number",
                },
              })}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-50 hover:bg-black-100 w-full"
              >
                Search
              </button>
            </div>

            {!isValid && (
              <Alert severity="error" message={errors?.search?.message} />
            )}
          </form>
        </div>
      </header>

      <section className="h-full mt-4">
        {campaigns === null ? (
          <section className="text-3xl font-medium p-60 text-center">
            Place a DID to start searching
          </section>
        ) : campaigns.length === 0 ? (
          <section className="text-3xl font-medium p-60 text-center">
            This DID doesn't have any related campaigns
          </section>
        ) : (
          <section className="flex flex-col md:grid lg:grid-cols-4 md:grid-cols-3 gap-6 max-container padding-container">
            {campaigns.map((campaign) => (
              <div key={campaign.id}>
                {<CampaignCard campaign={campaign.data} did={submittedDID || myDID} record={campaign.recordID} />}
              </div>
            ))}
          </section>
        )}
      </section>
    </>
  );
};

export default Campaigns;