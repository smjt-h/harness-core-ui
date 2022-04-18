import {Container, Layout, Text} from "@wings-software/uicore";
import {FontVariation} from "@wings-software/design-system";
import cx from "classnames";
import css from "@common/components/CostCalculator/CostCalculator.module.scss";
import React from "react";
import type {Module} from "framework/types/ModuleName";
import type {Editions} from "@common/constants/SubscriptionTypes";


interface PlanAndItems {
    edition: Editions,
    planItems : Array<[string, number]>
}


const ReviewPage = (module : Module, previouPlan) => {


    // const reviewTitle =
    //
    // return (
    //     <Layout.Vertical>
    //         <Text icon={'ff-solid'} font={{ variation: FontVariation.H3 }} className={cx(css.textwrap)}>
    //             {'title'}
    //         </Text>
    //         <Layout.Horizontal>
    //             <Container className={cx(css.reviewContainer)}>
    //                 <Text>
    //
    //                 </Text>
    //
    //             </Container>
    //
    //         </Layout.Horizontal>
    //     </Layout.Vertical>
    // )

}