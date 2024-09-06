import React from 'react'
import '../pages.css'
import { useTranslation } from 'react-i18next';

function Explore() {

    const {t} = useTranslation();

    return (
        <div className='page'>
            <h2 className='pageTitle'>{t("sidebar.explore_page")}</h2>
        </div>
    )
}

export default Explore