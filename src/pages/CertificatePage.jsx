import { useParams } from 'react-router-dom'
export default function CertificatePage(){const {id}=useParams(); return <div className="card p-8 text-center"><h2 className="text-3xl">Certificate of Completion</h2><p className="mt-3">Awarded for Course #{id}</p></div>}
