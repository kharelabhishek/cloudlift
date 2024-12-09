'use client';

import React, { useState } from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { sendEmailOTP, verifySecret } from '@/lib/actions/users.actions';
import { useRouter } from 'next/navigation';

const OtpModal = ({
  email,
  accountId
}: {
  email: string;
  accountId: string;
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const sessionId = await verifySecret(accountId, password);
      if (sessionId) router.push('/');
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResentOTP = async () => {
    try {
      await sendEmailOTP(email);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="shad-alert-dialog">
          <AlertDialogHeader className="relative flex justify-center">
            <AlertDialogTitle className="h2 text-center">
              Enter your OTP
              <Image
                src="/assets/icons/close-dark.svg"
                alt="close-icon"
                height={20}
                width={20}
                onClick={() => setIsOpen(false)}
                className={'otp-close-button'}
              />
            </AlertDialogTitle>
            <AlertDialogDescription className="subtitle-2 text-center text-light-100 ">
              We&#39;ve sent a code to{' '}
              <span className="pl-1 text-brand">{email}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            onChange={setPassword}
          >
            <InputOTPGroup className="shad-otp">
              <InputOTPSlot index={0} className="shad-otp-slot" />
              <InputOTPSlot index={1} className="shad-otp-slot" />
              <InputOTPSlot index={2} className="shad-otp-slot" />
              <InputOTPSlot index={3} className="shad-otp-slot" />
              <InputOTPSlot index={4} className="shad-otp-slot" />
              <InputOTPSlot index={5} className="shad-otp-slot" />
            </InputOTPGroup>
          </InputOTP>
          <AlertDialogFooter>
            <div className="flex w-full flex-col gap-4">
              <AlertDialogAction
                onClick={handleSubmit}
                className="shad-submit-btn h-12"
                type="button"
              >
                Continue
                {isLoading && (
                  <Image
                    src={'/assets/icons/loader.svg'}
                    alt={'loader'}
                    width={24}
                    height={24}
                    className={'ml-2 animate-spin'}
                  />
                )}
              </AlertDialogAction>
              <div className="subtitle-2 mt-2 text-center text-light-100">
                Didn&apos;t get a code?{' '}
                <Button
                  onClick={handleResentOTP}
                  variant="link"
                  className="pl-1 text-brand"
                >
                  Click to resend
                </Button>
              </div>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OtpModal;
