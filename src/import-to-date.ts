import { eq } from 'drizzle-orm';
import { db } from './db';
import * as schema from './db/schema';
import axios from 'axios';
import { parseXML } from 'node-xml-parser'

const main = async () => {
  const failedYears = [];

  for (let year = 2005; year <= new Date().getFullYear(); year++) {
    try {
      const { data } = await axios.get(`https://curs.bnr.ro/files/xml/years/nbrfxrates${year}.xml`)
      console.log(`Fetched year ${year}`);

      const existingExchangeRates = await db.select().from(schema.exchangeRate).where(
        eq(schema.exchangeRate.year, year)
      );
      console.log(`Found ${existingExchangeRates.length} existing exchange rates for year ${year}`);

      const parsedFile = parseXML(data.replace(`<?xml version="1.0" encoding="utf-8"?>`, ""));
      const bankDays = parsedFile?.children[1].children.filter((c) => c?.tag === "Cube") as any[];
      console.log(`Found ${bankDays.length} bank days`);

      for (let i = 0; i < bankDays.length; i++) {
        console.log(`Processed ${i + 1} / ${bankDays.length} bank days`);

        const bankDay = bankDays[i];
        const date = bankDay.attributes.get("date");
        const rates = bankDay.children?.filter((c: any) => c?.tag === "Rate") as any[];

        for (const rateEntry of rates) {
          const currency = rateEntry.attributes.get("currency");
          const multiplier = rateEntry.attributes.get("multiplier") ?? "1";
          const exchangeRate = rateEntry.children[0].attributes.get('data');

          const existingRate = existingExchangeRates.find((e) => e.currency === currency && e.date === date);
          if (!!existingRate) {
            console.log(`Found existing rate for ${currency} on ${date}`);

            if (existingRate.rate !== exchangeRate) {
              console.log(`Updating rate for ${currency} on ${date}`);
              await db.update(schema.exchangeRate).set({
                rate: exchangeRate,
                multiplier
              }).where(eq(schema.exchangeRate.id, existingRate.id));
            }
            continue;
          }

          await db.insert(schema.exchangeRate).values({
            date,
            currency,
            rate: exchangeRate,
            multiplier,
            year
          });
        }
      }
    } catch (error) {
      console.error(error);
      console.error(`Failed to fetch year ${year}`);
      failedYears.push(year);
    }

    // break;
  }

  console.log(`The following years failed: ${failedYears.join(", ")}`);

  await db.$client.end();
};

main();
