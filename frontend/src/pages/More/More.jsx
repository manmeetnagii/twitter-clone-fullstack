import React from 'react'
import '../pages.css'
import { useTranslation } from 'react-i18next';

function More() {

    const {t} = useTranslation();

    return (
        <div className='page'>
            <h2 className='pageTitle'>{t("sidebar.more_page")}</h2>
        </div>
    )
}

export default More