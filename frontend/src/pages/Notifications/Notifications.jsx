import React from 'react'
import '../pages.css'
import { useTranslation } from 'react-i18next';

function Notifications() {

    const {t} = useTranslation();

    return (
        <div className='page'>
            <h2 className='pageTitle'>{t("sidebar.notification_page")}</h2>
        </div>
    )
}

export default Notifications