/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseBoolean, ResponsePageUserGroupAggregateDTO, ResponseUserAggregate } from 'services/cd-ng'

export const userInfo: ResponseUserAggregate = {
  status: 'SUCCESS',
  data: {
    user: { name: 'dummy', email: 'dummy@harness.io', uuid: 'dummy' },
    roleAssignmentMetadata: [
      {
        identifier: 'role_assignment_JZcId0QnciEQsfOtUYlo',
        roleIdentifier: 'New_Role',
        roleName: 'New Role',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: false,
        managedRoleAssignment: false
      },
      {
        identifier: 'role_assignment_wHQ0QnLTID3MSVGzKchN',
        roleIdentifier: 'TestRole',
        roleName: 'TestRole',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: false,
        managedRoleAssignment: false
      },
      {
        identifier: 'role_assignment_VSS2NofHI92c9TibXh03',
        roleIdentifier: '_account_dummy',
        roleName: 'Account dummy',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: true,
        managedRoleAssignment: false
      },
      {
        identifier: 'role_assignment_gfLKLhqViVlNahxOfks7',
        roleIdentifier: '_account_viewer',
        roleName: 'Account Viewer',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: true,
        managedRoleAssignment: false
      },
      {
        identifier: 'role_assignment_RkYa8Hrtp2CZJIJbUE7C',
        roleIdentifier: 'ufbvfbvbfv',
        roleName: 'ufbvfbvbfv',
        resourceGroupIdentifier: '_all_account_level_resources',
        resourceGroupName: 'All Resources',
        managedRole: false,
        managedRoleAssignment: false
      }
    ]
  },
  metaData: {},
  correlationId: ''
}
export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const userGroupInfo = {
  status: 'SUCCESS',
  data: [
    {
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      identifier: 'test',
      name: 'testGroup',
      users: ['u1'],
      notificationConfigs: [],
      description: '',
      tags: {}
    }
  ],
  metaData: '',
  correlationId: ''
}

export const userGroupsAggregate: ResponsePageUserGroupAggregateDTO = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 10,
    content: [
      {
        userGroupDTO: {
          accountIdentifier: 'accountId',
          identifier: 'abc',
          name: 'abc_name',
          users: ['xyz1', 'xyz2'],
          notificationConfigs: [],
          description: '',
          tags: {},
          ssoLinked: false
        },
        users: [
          {
            name: 'xyz1',
            email: 'xyz1@test.io',
            uuid: 'xyz1',
            locked: false
          },
          {
            name: 'xyz2',
            email: 'xyz2@test.io',
            uuid: 'xyz2',
            locked: false
          }
        ],
        roleAssignmentsMetadataDTO: [],
        lastModifiedAt: 1627886721254
      },
      {
        userGroupDTO: {
          accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
          identifier: 'test',
          name: 'testGroup',
          users: ['u1'],
          notificationConfigs: [],
          description: '',
          tags: {}
        },
        users: [
          {
            name: 'dummy',
            email: 'dummy@harness.io',
            uuid: 'dummy',
            locked: false
          }
        ],
        roleAssignmentsMetadataDTO: [],
        lastModifiedAt: 1627886721254
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: undefined,
  correlationId: '0f832df3-d742-4689-950b-f30573d1db5a'
}
