import { LoginFail } from "./components/LoginFail";

export const dynamic = "force-dynamic";

export default async function Page({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {

    let errorMessage = "Algo salió mal, por favor contacta a soporte.";

    if (searchParams?.err !== undefined) {
        const errorCode = searchParams["err"];
        switch (errorCode) {
            case "AuthApiError":
                errorMessage = "¡Ups! Parece que intentaste abrir el enlace mágico desde otro dispositivo o navegador.";
                break;
            case "500":
                errorMessage = "Algo salió mal, por favor contacta a soporte.";
                break;
        }
    }

    return (
        <div className="flex flex-col flex-1 w-full h-[calc(100vh-73px)]">
            <LoginFail errorMessage={errorMessage} />
        </div>
    );
}
