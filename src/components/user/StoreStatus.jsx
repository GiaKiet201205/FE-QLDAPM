export default function StoreStatus({loading,error,retry}){
 return <div className="gk-container gk-empty" role={error?'alert':'status'}><p>{error||'Đang tải dữ liệu từ trung tâm...'}</p>{error&&<button className="gk-button" onClick={retry}>Thử lại</button>}</div>;
}
