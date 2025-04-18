import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'


const MobileNumberInput = ({ value, handleChange, name }) => {
    // const [value, setValue] = useState('');

    const handleChanges = (e) => {
        console.log(e, "e+++")
        handleChange({ target: { value: e, name: name } })
    }
    return (
        <PhoneInput
            international
            placeholder="Enter phone number"
            className="w-full"
            value={value}
            style={{
                border: '1px solid lightgray',
                padding: "9px",
                borderRadius: "4px"
            }}
            onChange={handleChanges} />
    )
};

export default MobileNumberInput;