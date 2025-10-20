import Stripe from 'stripe';
import config from '../../config';

const stripe = new Stripe(config.STRIPE_SECRET_KEY);

export const createConnectAccount = async (email: any) => {
  console.log(config.STRIPE_SECRET_KEY);
  console.log(config.STRIPE_COUNTRY);
  console.log(config.STRIPE_CONTROLLER);
  const customer = await stripe.accounts.create({
    country: config.STRIPE_COUNTRY,
    email,
    capabilities: {
      card_payments: {
        requested: true,
      },
      transfers: {
        requested: true,
      },
    },
    controller: {
      fees: {
        payer: config.STRIPE_CONTROLLER,
      },
      losses: {
        payments: config.STRIPE_CONTROLLER,
      },
      stripe_dashboard: {
        type: config.STRIPE_DASHBOARD,
      },
      requirement_collection: config.STRIPE_CONTROLLER,
    },
  });
  return customer;
};

export const getBalance = async (stripeCustomerId: any) => {
  const customer: any = await stripe.customers.retrieve(stripeCustomerId);
  return customer.balance;
};

export const createPayout = async (amount: any, destination: any, stripeID: any) => {
  try {
    const payout: any = await stripe.payouts.create({
      amount: amount,
      currency: config.STRIPE_CURRENCY,
      destination: destination,
    }, {
      stripeAccount: stripeID,
    });
    return payout;
  } catch (error) {
    return error;
  }
};

export const addExternalAccount = async (accountId: any, details: any) => {
  try {
    const account = await stripe.accounts.createExternalAccount(accountId, {
      external_account: details,
    });
    return account;
  } catch (error: any) {
    return {
      error: true,
      message: error.raw.message
    };
  }
};
