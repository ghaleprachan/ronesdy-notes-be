import { Wallet } from '../../models/v1/wallet.model';
import { DEDUCTIONS, WALLET_CONTROLLER } from '../../utils/enum';
import { addExternalAccount, createConnectAccount, createPayout, getBalance } from '../../services/stripe/stripe';
import { User } from '../../models/v1/user.model';
import mongoose from 'mongoose';

class WalletRepository {
  async createStripeCustomer(email: any) {
    try {
      const customer = await createConnectAccount(email);
      return customer;
    } catch (error) {
      console.log('error', error);
      throw new Error(WALLET_CONTROLLER.VALIDATION.STRIPE_CREATION_FAILED);
    }
  }

  async createWallet(userId: any, stripeCustomerId: any) {
    const wallet = new Wallet({ userId, stripeCustomerId, balance: 0 });
    await wallet.save();
    return wallet;
  }

  async getWalletByUserId(userId: any) {
    return Wallet.findOne({ userId });
  }

  async addBalance(userId: any, amount: any) {
    try {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw new Error(WALLET_CONTROLLER.VALIDATION.WALLET_NOT_FOUND);
      }
  
      wallet.balance += Number(amount);
      await wallet.save();
  
      return wallet;
    } catch (error) {
      throw error;
    }
  }

  async deductBalance(userId: any, amount: any) {
    try {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw new Error(WALLET_CONTROLLER.VALIDATION.WALLET_NOT_FOUND);
      }
  
      wallet.balance -= amount;
      await wallet.save();
  
      return wallet;
    } catch (error) {
      throw error;
    }
  }

  async getUserBalance(stripeCustomerId: any) {
    try {
      const balance: any = await getBalance(stripeCustomerId);
      return balance;
    } catch (error) {
      throw new Error(WALLET_CONTROLLER.VALIDATION.RETRIEVE_BALANCE_FAILED);
    }
  }

  async withdrawBalance(amount: any, destination: any, stripeID: any) {
    try {
      const payout: any = await createPayout(amount, destination, stripeID);
      return payout;
    } catch (error) {
      return error;
    }
  }

  async addPaymentMethodToStripe(accountId: any, details: any) {
    try {
      const account: any = await addExternalAccount(accountId, details);
      if (!account?.error) {
        await Wallet.findOneAndUpdate(
          { stripeCustomerId: accountId },
          {
            $set: {
              'destinations.0': {
                type: details.object,
                id: account?.id,
                accountHolder: account?.account_holder_name,
                bankName: account?.bank_name,
                lastFour: account?.last4,
              },
            },
          },
        );
      }

      return account;
    } catch (error) {
      throw new Error(
        WALLET_CONTROLLER.VALIDATION.PAYMENT_METHOD_CREATION_FAILED,
      );
    }
  }

  async getMarketplaceCommision(userID: any) {
    try {
      const commission = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userID) } },
        {
          $lookup: {
            from: 'plans',
            localField: 'subscriptionPlan',
            foreignField: '_id',
            as: 'planDetails',
          },
        },
        { $unwind: '$planDetails' },
        {
          $project: {
            marketplaceCommission: '$planDetails.marketplaceCommission',
          },
        },
      ]).exec();
      return commission.length > 0
        ? commission[0].marketplaceCommission
        : DEDUCTIONS.DEFAULT_APP_COMMISION || DEDUCTIONS.DEFAULT_APP_COMMISION;
    } catch (error) {
      return DEDUCTIONS.DEFAULT_APP_COMMISION;
    }
  }
}

export default WalletRepository;
