import {APP_NAME} from "../../config/constants.ts";
import {getFirstLetter} from "../../config/nameHelpers.ts";

type props = {
    text?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function Icon
(
    {
        text = getFirstLetter(APP_NAME),
        ...rest
    }
    : props
)
{
    return(
        <div
            className="w-12 h-12 bg-gradient-to-br from-primary to-purple-700 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-3"
            {...rest}
        >
            {text}
        </div>
    );
}