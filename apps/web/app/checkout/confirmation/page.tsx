"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, CreditCard, Banknote } from "lucide-react"
import Link from "next/link"

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const paymentMethod = searchParams.get("payment") || "cod"

  const isBankTransfer = paymentMethod === "bank_transfer"

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-fitnest-green" />
            </div>
            <CardTitle className="text-2xl text-fitnest-green">Commande confirmée !</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderId && (
                <p className="text-sm font-mono bg-gray-100 rounded-lg px-4 py-2 inline-block">
                  N° de commande : <strong>#{orderId}</strong>
                </p>
              )}
              <p className="text-gray-600">
                Merci pour votre commande ! Nous l&apos;avons bien reçue et elle sera traitée dans les plus brefs délais.
              </p>

              {isBankTransfer ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-medium">
                    <CreditCard className="h-5 w-5" />
                    Virement bancaire — en attente
                  </div>
                  <p className="text-sm text-amber-600">
                    Veuillez effectuer le virement aux coordonnées bancaires suivantes. Votre commande sera validée dès réception du paiement.
                  </p>
                  <div className="bg-white rounded-md p-3 text-sm space-y-1 text-gray-700">
                    <p><strong>Banque :</strong> CIH Bank</p>
                    <p><strong>IBAN :</strong> MA76 0000 0000 0000 0000 0000 000</p>
                    <p><strong>Bénéficiaire :</strong> FitNest SARL</p>
                    <p><strong>Référence :</strong> {orderId ? `CMD-${orderId}` : "À préciser par email"}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <Banknote className="h-5 w-5" />
                    Paiement à la livraison
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Vous réglerez en espèces à la réception de votre commande.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                Un email de confirmation vous a été envoyé avec les détails de votre commande.
              </div>

              <div className="flex gap-4 justify-center mt-6">
                <Link href="/express-shop">
                  <Button variant="outline">Continuer mes achats</Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="bg-fitnest-green hover:bg-fitnest-green/90">Mon espace</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]">Chargement...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
