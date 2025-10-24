import 'dotenv/config';
import path from 'path';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { db } from './db';
import { exchangeRate } from './db/schema';
import { and, eq } from 'drizzle-orm';

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.get('/rate/:date', async (req: Request, res: Response) => {
  try {

    const currency = req.query.currency;
    const autoWalkBack = req.query.autoSelectLastBankDay === "true";

    if (!req.params.date) {
      return res.status(400).json({
        error: 'Missing date.'
      });
    };

    const [year, month, day] = req.params.date.split('-');
    if (year?.length !== 4 || month?.length !== 2 || day?.length !== 2) {
      return res.status(400).json({
        error: 'Invalid date format. Should be YYYY-MM-DD (ISO Date string)'
      });
    };

    const exchangeRates = await db.select().from(exchangeRate).where(
      and(
        eq(exchangeRate.date, req.params.date),
        !!currency ? eq(exchangeRate.currency, currency as string) : undefined
      )
    );

    if (autoWalkBack && !exchangeRates?.length) {
      for (let i = 1; i < 3; i++) {
        const baseDate = new Date(req.params.date);
        baseDate.setDate(baseDate.getDate() - i);
        const date = baseDate.toISOString().split('T')[0];
        const exchangeRates = await db.select().from(exchangeRate).where(
          and(
            eq(exchangeRate.date, date),
            !!currency ? eq(exchangeRate.currency, currency as string) : undefined
          )
        );

        if (exchangeRates?.length) {
          return res.status(200).json({
            exchangeRates,
            autoSelectedLastBankDay: date
          });
        }
      }
    }

    if (!exchangeRates?.length) {
      return res.status(404).json({
        error: 'No exchange rates found for this date.'
      });
    }

    return res.status(200).json({
      exchangeRates,
      autoSelectedLastBankDay: null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal server error.'
    });
  }
});

app.get("/what", (_, res) => {
  return res.sendFile(path.resolve("what.txt"));
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
