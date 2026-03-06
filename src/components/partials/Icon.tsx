import {APP_INITIALS} from "../../../utils/constants.ts";

type props = {
    text?: string;
    size: number;
} & React.HTMLAttributes<HTMLDivElement>;

export function Icon
(
    {
        text = APP_INITIALS,
        size = 1,
        ...rest
    }
    : props
)
{
    //Default styling
    let styles: string = "";

    //Pinakagamay
    if (size === 1)
        styles="w-8 h-8 bg-gradient-to-br from-primary to-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-lg";
    //Pinakadako
    else if (size === 2)
        styles = "w-12 h-12 bg-gradient-to-br from-primary to-purple-700 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-3";

    return(

        <div
            className={styles}
            {...rest}
        >
            {text}
        </div>
    );
}