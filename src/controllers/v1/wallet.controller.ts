import { Request, Response, NextFunction } from 'express';
import WalletRepository from '../../repositories/v1/wallet.repository';
import { StatusCodes } from 'http-status-codes';
import { DEDUCTIONS, WALLET_CONTROLLER } from '../../utils/enum';

export default class WalletController {
  private readonly walletRepository: WalletRepository;

  constructor() {
    this.walletRepository = new WalletRepository();
  }

  async getWalletBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const userID = req.body.userID;
      let wallet: any = await this.walletRepository.getWalletByUserId(userID);
      const stripeCustomerId = wallet.stripeCustomerId;

      if (!stripeCustomerId) {
        res.status(StatusCodes.BAD_REQUEST).send({
          success: false,
          message: WALLET_CONTROLLER.VALIDATION.STRIPE_ID_REQUIRED,
        });
        return;
      }
      const balance = wallet.balance;
      const destinations = wallet.destinations;

      let marketplaceCommision = await this.walletRepository.getMarketplaceCommision(userID);
      let appleCommission = DEDUCTIONS.APPLE_COMMISION;

      res.status(StatusCodes.OK).send({
        success: true,
        message: WALLET_CONTROLLER.SUCCESS.BALANCE_RETRIEVED,
        balance,
        marketplaceCommision,
        appleCommission,
        destinations
      });
    } catch (error) {
      next(error);
    }
  }

  async withdrawBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const userID = req.body.userID;
      const amount = req.body.amount;
      const balance = req.body.balance;
      let amountInCents = Math.round(amount*100);
      let wallet: any = await this.walletRepository.getWalletByUserId(userID);
      if(wallet.destinations && wallet.destinations.length > 0){
        let res = await this.walletRepository.withdrawBalance(amountInCents, wallet.destinations[0].id, wallet.stripeCustomerId);
        await this.walletRepository.deductBalance(userID, balance);
      }
      else{
        res.status(StatusCodes.NOT_FOUND).send({
          success: false,
          message: WALLET_CONTROLLER.VALIDATION.PAYMENT_METHOD_NOT_FOUND,
        });
      }
      res.status(StatusCodes.OK).send({
        success: true,
        message: WALLET_CONTROLLER.SUCCESS.WITHDRAW_BALANCE_REQUESTED,
      });
    } catch (error) {
      next(error);
    }
  }

  async addPaymentMethod(req: Request, res: Response, next: NextFunction) {
    try {
      const userID = req.body.userID;
      let wallet: any = await this.walletRepository.getWalletByUserId(userID);
      const accountDetails = req.body.accountDetails;

      let response = await this.walletRepository.addPaymentMethodToStripe(
        wallet.stripeCustomerId,
        accountDetails,
      );
      if(response.error){
        res.status(StatusCodes.BAD_REQUEST).send({
          success: false,
          message: response.message,
        });
      }
      res.status(StatusCodes.OK).send({
        success: true,
        message: WALLET_CONTROLLER.SUCCESS.PAYMENT_METHOD_ADDED,
      });
    } catch (error) {
      next(error);
    }
  }
}
