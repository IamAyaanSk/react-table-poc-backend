import {
  PrismaClient,
  LedgerType,
  LedgerPurpose,
  Ledger,
} from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const ledgerSeedData: Ledger[] = [];

  for (let i = 0; i < 100000; i++) {
    const amount = parseFloat(
      faker.finance.amount({
        min: 100,
        max: 1000,
      })
    );
    const openingBalance = parseFloat(
      faker.finance.amount({
        min: 1000,
        max: 10000,
      })
    );
    const closingBalance = openingBalance + amount;
    const dateTime = faker.date.recent();
    const ledgerType = faker.helpers.arrayElement([
      LedgerType.CREDIT,
      LedgerType.DEBIT,
    ]);
    const ledgerPurpose = faker.helpers.arrayElement(
      Object.values(LedgerPurpose)
    );
    const service = faker.commerce.product();
    const transferredTo = faker.internet.userName();
    const description = faker.lorem.sentence();
    const referenceId = faker.string.uuid();
    const id = faker.string.uuid();

    ledgerSeedData.push({
      id,
      amount,
      openingBalance,
      closingBalance,
      dateTime,
      type: ledgerType,
      purpose: ledgerPurpose,
      service,
      transferredTo,
      description,
      referenceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await prisma.ledger.createMany({
    data: ledgerSeedData,
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
