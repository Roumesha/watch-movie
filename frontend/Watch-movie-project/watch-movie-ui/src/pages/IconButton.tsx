const IconButton=({
    children,
    label,
    onClick,
    danger
}:{
    children:React.ReactNode;
    label:string;
    onClick:()=>void;
    danger?:boolean;
})=>(
    <button
    className={`icon-btn ${danger?"danger":""}`}
    onClick={onClick}>
        {children}
        <span>{label}</span>
    </button>
)
export default IconButton;