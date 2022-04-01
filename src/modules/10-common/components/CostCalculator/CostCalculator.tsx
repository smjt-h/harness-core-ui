import React from 'react'
import {Card, Color, Layout, Text} from "@wings-software/uicore";
import {FontVariation} from '@harness/design-system'
import cx from 'classnames'
import usagecardIcon from './images/usagebig.png'
import currentcardIcon from './images/currentbig.png'
import overusecardIcon from './images/overusebig.png'
import recommendedcardIcon from './images/recommendedbig.png'
import css from './CostCalculator.module.scss';

interface InfoBoxParams {
    title: string;
    background: any;
    iconImage: any;
    numericValue: number;
    description: string;
}

const InfoBox = ({title, background, iconImage, numericValue, description}: InfoBoxParams) => {
    return (
        <Card className={background}>
            <Layout.Vertical>
                <Text font={{variation : FontVariation.SMALL_SEMI}}>
                    {title}
                </Text>
                <Layout.Horizontal>
                    <Text icon={iconImage} font={{variation : FontVariation.H2}}>
                        {numericValue}
                    </Text>
                    <Text font={{variation : FontVariation.SMALL}}>
                        {description}
                    </Text>
                </Layout.Horizontal>
            </Layout.Vertical>
        </Card>
    );
};

interface InfoBoxReducedParams {
    title: string;
    numericValue: number;
    description: string;
}

const PlanBox = ({title, numericValue, description}: InfoBoxReducedParams) => {
    return InfoBox({title: title,background : cx(css.infocard), iconImage: currentcardIcon, numericValue: numericValue, description: description});
}

const UsageBox = ({title, numericValue, description}: InfoBoxReducedParams) => {
    return InfoBox({title: title,background : cx(css.infocard), iconImage: usagecardIcon, numericValue: numericValue, description: description});
}

const OveruseBox = ({title, numericValue, description}: InfoBoxReducedParams) => {
    return InfoBox({title: title,background : cx(css.infocard, css.overuse), iconImage: overusecardIcon, numericValue: numericValue, description: description});
}

const RecommendedBox = ({title, numericValue, description}: InfoBoxReducedParams) => {
    return InfoBox({title: title,background : cx(css.infocard, css.recommended), iconImage: recommendedcardIcon, numericValue: numericValue, description: description});
}

const calulateCost = (unitsInUse: number, costSlabs : Array<[number, number]>) => {
    let totalCost = 0;
    for(const priceSlab of costSlabs) {
        const [units, price] = priceSlab;
        if(unitsInUse <= units) {
            totalCost += price*unitsInUse;
            break;
        } else {
            totalCost += price*units;
            unitsInUse -= units;
        }
    }
    return totalCost;
}

const CostSlider = (unitsInPlan, unitsInUse, recommendedUse, costSlabs) => {
    const units = costSlabs[costSlabs.length -1][0];
    const totalSize = Math.round(units*1.1);

    const barColourBack = unitsInUse <= unitsInPlan ? Color.GREEN_600 : Color.YELLOW_900;

    const costBars = [];
    let startUnit = 1;
    for(let slab = 0; slab < costSlabs.length; slab+=1) {
        const [units, price] = costSlabs[slab];
        const barLength = (units - startUnit)/totalSize;
        if(slab === 1) {
            const bar = (
                <div width={}>

                </div>
            )
        }
    }






}