import React, { useState } from 'react';
import { Button, Card, Col, Row, Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import IconFont from '@/components/IconFont';
import styles from './index.less';

const { Text, Link, Title, Paragraph } = Typography;

const Home = () => {
  const [logList] = useState([
    {
      version: 'v1.1.0',
      datetime: '2021-09-12',
      content: ['添加区域管理功能；', '修复一些bug。'],
    },
    {
      version: 'v1.0.0',
      datetime: '2021-01-01',
      content: ['Amy系统正式发布。'],
    },
  ]);
  return (
    <div className={styles.container}>
      <Row gutter={16}>
        <Col xs={24} sm={24} md={24} lg={16} xl={16}>
          <Card title={<Title level={3}>发布任务</Title>}>
            <Typography>
              <Paragraph>
                初入行时，祖师爷“高司令”赏饭吃，一直想写套后台管理系统报答。怎奈学艺不精，丢了祖师爷的脸，此为心结。
                后来转投布兰登大师门下，与后台同事配合工作，想趁工作不忙时提前把后台管理的工作先弄起来，谁知半年过去了，同事都没有提供一个接口，然后我就亲自下场了。
                这便有了它。
              </Paragraph>
              <Paragraph>
                <Text strong>当前版本：{logList[0].version}</Text>
              </Paragraph>
              <Paragraph>
                <Button danger>
                  <IconFont type="icon-rmb" />
                  免费开源
                </Button>
              </Paragraph>
              <Paragraph>
                <Button icon={<GithubOutlined />}>
                  <span>
                    <Link href="https://github.com/hankaibo/amy-java/" target="_blank">
                      后台源码
                    </Link>
                  </span>
                </Button>
                <Button icon={<GithubOutlined />}>
                  <span>
                    <Link href="https://github.com/hankaibo/amy-react/" target="_blank">
                      前端源码
                    </Link>
                  </span>
                </Button>
              </Paragraph>
            </Typography>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
