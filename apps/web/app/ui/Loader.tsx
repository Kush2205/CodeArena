
interface Props {
    color?: string;
    size?: 'small' | 'medium' | 'large';
}

function Loader(props: Props) {
    const { color, size } = props
    
    return (
       <div className={`flex justify-center items-center w-10 h-10 border-2 border-t-transparent border-b-transparent rounded-full animate-spin ${size === 'small' ? 'border-4' : size === 'medium' ? 'border-8' : 'border-12'} ${color ? `border-${color}` : 'border-black'}`}>

       </div>
    )
}

export default Loader
