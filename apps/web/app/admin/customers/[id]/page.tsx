import CustomerDetailContent from "./customer-detail-content"

interface PageProps {
  params: {
    id: string
  }
}

export default function CustomerDetailPage({ params }: PageProps) {
  return <CustomerDetailContent customerId={params.id} />
}
